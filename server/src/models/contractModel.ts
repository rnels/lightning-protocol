import { PoolClient } from 'pg';
import db from '../db/db';
import { Bid, Contract, Pool, PoolLock, Trade } from '../types';
import { withdrawPaper, depositPaper } from './accountModel';
import { removeBid } from './bidModel';
import { getActiveContractTypeById, getContractTypeById } from './contractTypeModel';
import {
   _createPoolLock,
  _addToTradeFees,
  getPoolsByAssetId,
  getUnlockedAmountByAssetId,
  getUnlockedAmountByPoolId,
  _removePoolLocksByContractId,
  _sellPoolLockAssets
} from './poolModel';
import { _createTrade } from './tradeModel';
import { getAssetPrice } from '../prices/getPrices';
import { getAssetById } from './assetModel';

const poolFee = 0.01;

// Finds matching bids with prices higher than or equal to the contract ask price
// If there are matches, executes a trade on the highest bid
// When this is called, there should be a bid in the table, don't call this before creating a bid
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
async function _getMatchingBidsByAsk(contract: Contract) {
  let bids = (await
    db.query(`
      SELECT
        bid_id as "bidId",
        type_id as "typeId",
        account_id as "accountId",
        bid_price as "bidPrice",
        created_at as "createdAt"
      FROM bids
        WHERE type_id=$1
          AND bid_price>=$2
      ORDER BY bid_price DESC
    `, [contract.typeId, contract.askPrice])
  ).rows as Bid[];
  if (bids.length === 0) return;
  let bid = bids[0];
  _tradeContract(contract, bid);
}

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
function _setExercised(contract: Contract, exercisedAmount: number, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  return query(`
    UPDATE contracts
    SET
      exercised=true,
      exercised_amount=$2
    WHERE contract_id=$1
  `,
  [
    contract.contractId,
    exercisedAmount
  ]);
}

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
function _updateOwnerId(contract: Contract, newOwnerId: number, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  return query(`
    UPDATE contracts
    SET owner_id=$2
      WHERE contract_id=$1
  `,
  [
    contract.contractId,
    newOwnerId
  ]);
}

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
async function _getContractById(id: string | number): Promise<Contract> {
  const res = await db.query(`
    SELECT
      contract_id as "contractId",
      type_id as "typeId",
      owner_id as "ownerId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised,
      exercised_amount as "exercisedAmount"
    FROM contracts
      WHERE contract_id=$1
  `, [id]);
  return res.rows[0];
}

export async function getAllContracts(sort='contract_id ASC'): Promise<Contract[]> {
  const res = await db.query(`
    SELECT
      contract_id as "contractId",
      type_id as "typeId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised,
      exercised_amount as "exercisedAmount"
    FROM contracts
      ORDER BY $1
  `, [sort]);
  return res.rows;
}

export async function getContractById(id: string | number): Promise<Contract> {
  const res = await db.query(`
    SELECT
      contract_id as "contractId",
      type_id as "typeId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised,
      exercised_amount as "exercisedAmount"
    FROM contracts
      WHERE contract_id=$1
  `, [id]);
  return res.rows[0];
}

export async function getActiveContractsByTypeId(typeId: string | number): Promise<Contract[]> {
  const res = await db.query(`
    SELECT
      contract_id as "contractId",
      type_id as "typeId",
      owner_id as "ownerId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised,
      exercised_amount as "exercisedAmount"
    FROM contracts
      WHERE type_id=$1
        AND exercised=false
  `, [typeId]);
  return res.rows;
}

export async function getContractsByOwnerId(ownerId: string | number): Promise<Contract[]> {
  const res = await db.query(`
    SELECT
      contract_id as "contractId",
      type_id as "typeId",
      owner_id as "ownerId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised,
      exercised_amount as "exercisedAmount"
    FROM contracts
      WHERE owner_id=$1
  `, [ownerId]);
  return res.rows;
}

// Creates a contract, locks in amounts to pools
// Creating a contract does not assign it an owner by default, since they're not created by people
// Just requires a type and an ask price
// Only accepting owner_id for debug atm
// TODO: Decide if the sell to close should credit the pool owners with initial tradeFees that reflect a higher percentage of the sale (i.e. 50%)
export async function createContract(contract: Contract) {
  let contractType = await getContractTypeById(contract.typeId);
  let unlockedPoolAssetTotal = await getUnlockedAmountByAssetId(contractType.assetId);
  if (unlockedPoolAssetTotal < contractType.assetAmount) throw new Error('Not enough unlocked assets to create contract');
  let client = await db.connect();
  try {
    await client.query('BEGIN');
    const contractId = (await client.query(`
      INSERT INTO contracts (
        type_id,
        owner_id,
        ask_price
      ) VALUES ($1, $2, $3)
      RETURNING contract_id as "contractId"
    `,
    [
      contract.typeId,
      contract.ownerId,
      contract.askPrice
    ])).rows[0].contractId as number;
    contract.contractId = contractId;
    let pools = await getPoolsByAssetId(contractType.assetId);
    let poolLockPromises = [];
    let unallocatedAmount = contractType.assetAmount;
    // Okay, so this should create a pool lock for all pools with
    // Unlocked assets, cascading down until the contract is spent on locks
    for (let pool of pools) {
      let unlockedAmount = await getUnlockedAmountByPoolId(pool.poolId!); // TODO: Could technically get locked amounts and do the sum here
      if (unlockedAmount > 0) {
        let allocatedAmount = unallocatedAmount >= unlockedAmount ? unlockedAmount : unallocatedAmount;
        let poolLock: PoolLock = {
          poolId: pool.poolId!,
          contractId,
          assetAmount: allocatedAmount,
          expiresAt: contractType.expiresAt
        }
        poolLockPromises.push(_createPoolLock(poolLock, client));
        unallocatedAmount -= allocatedAmount;
        if (!unallocatedAmount) break; // Stops creating new pools when amount hits 0
      }
    }
    await Promise.all(poolLockPromises);
    await client.query('COMMIT');
    _getMatchingBidsByAsk(contract); // TODO: Ensure this doesn't need any error catching
    client.release();
  } catch (e) {
    console.log(e); // DEBUG
    await client.query('ROLLBACK');
    client.release();
    throw new Error('Contract could not be created');
  }
}

// TODO: Ensure someone can't set an ask price on expired contracts
export async function updateAskPrice(contractId: string | number, askPrice: number, ownerId: string | number) {
  const contract = (await db.query(`
    UPDATE contracts
    SET ask_price=$2
      WHERE contract_id=$1
        AND owner_id=$3
        AND exercised=false
    RETURNING
      contract_id as "contractId",
      type_id as "typeId",
      owner_id as "ownerId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised,
      exercised_amount as "exercisedAmount"
  `,
  [
    contractId,
    askPrice,
    ownerId
  ])).rows[0] as Contract; // Should return undefined if no contract matches the WHERE conditionals
  if (contract) { _getMatchingBidsByAsk(contract); }
}

// For use where a contract is either sold or the listing is removed
export function removeAskPrice(contractId: string | number, accountId: string | number, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  return query(`
    UPDATE contracts
    SET ask_price=null
      WHERE contract_id=$1
      AND owner_id=$2
  `,
  [
    contractId,
    accountId
  ]);
}

// JavaScript can I please have access modifiers
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _tradeContract(contract: Contract, bid: Bid) {
  if (!contract.contractId || !bid.bidId) return; // DEBUG
  let client = await db.connect();
  try {
    let assetAmount = (await getActiveContractTypeById(contract.typeId)).assetAmount;
    let saleCost = contract.askPrice! * assetAmount;
    let tradeFee = saleCost * poolFee;
    let sellerProceeds = saleCost - tradeFee;
    let trade: Trade = {
      contractId: contract.contractId,
      typeId: contract.typeId,
      buyerId: bid.accountId,
      sellerId: contract.ownerId!,
      salePrice: contract.askPrice!,
      tradeFee
    };
    await client.query('BEGIN');
    await Promise.all([
      withdrawPaper(bid.accountId, saleCost, client),
      depositPaper(contract.ownerId!, sellerProceeds, client),
      _addToTradeFees(contract.contractId, tradeFee, client),
      _createTrade(trade, client),
      removeBid(bid.bidId, bid.accountId, client),
      removeAskPrice(contract.contractId, contract.ownerId!, client),
      _updateOwnerId(contract, bid.accountId, client)
    ])
    await client.query('COMMIT');
  } catch(e) {
    console.log(e); // DEBUG
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

// Should only be called in route by authenticated user
// TODO: Make sure locks are removed on contract expiry as well, which will be kind of tough, requires a listener of some kind
// TODO: Treat compensation / exercising differently if it's a put rather than a call, currently operating as if it's just a call
export async function exerciseContract(contractId: number, ownerId: number) {
  let contract = await _getContractById(contractId);
  if (contract.ownerId !== ownerId) {
    throw new Error('Provided ownerId does not match contract.ownerId');
  }
  if (contract.exercised) {
    throw new Error('Contract has already been exercised');
  }

  // Should return an error if the contract is past expiry
  // TODO: Test this, may just return undefined
  let contractType = await getActiveContractTypeById(contract.typeId);
  if (!contractType) {
    throw new Error('Active contractType could not be found');
  }
  let asset = await getAssetById(contractType.assetId);
  let assetPrice = await getAssetPrice(asset.priceApiId!, asset.assetType); // Not catching potential error on getAssetPrice on purpose
  if (assetPrice < contractType.strikePrice) {
    throw new Error('Contract with asset market price under strike price can not be exercised');
  }
  let client = await db.connect();
  try {
    await client.query('BEGIN');
    let poolFee = contractType.strikePrice * contractType.assetAmount;
    let saleProfits = (assetPrice * contractType.assetAmount) - poolFee;
    // Add to trade_fees for pool_locks paper equating to the assetAmount * strike price
    // NOTE: Ensure this is resolved before _sellPoolLockAssets and _distributePoolLockFees are invoked
    await _addToTradeFees(contract.contractId!, poolFee, client);
    await _sellPoolLockAssets(contract.contractId!, client);
    await depositPaper(contract.ownerId, saleProfits, client); // Provide contract owner / exerciser with remaining paper, which equates to (assetAmount * market price) - (assetAmount * strike price)
    if (contract.askPrice) { await removeAskPrice(contract.contractId!, contract.ownerId, client); }
    await _setExercised(contract, saleProfits, client);
    await client.query('COMMIT');
    client.release();
  } catch(e) {
    console.log(e); // DEBUG
    await client.query('ROLLBACK');
    client.release();
    throw new Error('There was an error exercising the contract');
  }
}
