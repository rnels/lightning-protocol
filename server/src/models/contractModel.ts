import { PoolClient } from 'pg';
import db from '../db/db';
import { Bid, Contract, Pool, PoolLock, Trade } from '../types';
import { withdrawPaper, depositPaper } from './accountModel';
import { _removeBid } from './bidModel';
import { getActiveContractTypeById } from './contractTypeModel';
import {
   _createPoolLock,
  _addToLockTradeFees,
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
async function _getMatchingBidsByAsk(contract: Contract, client: PoolClient) {
  let bids = (await
    client.query(`
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
  return bids;
}

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
function _setExercised(contract: Contract, exercisedAmount: number, client: PoolClient) {
  return client.query(`
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
function _updateOwnerId(contractId: number, newOwnerId: number, client: PoolClient) {
  return client.query(`
    UPDATE contracts
    SET owner_id=$2
      WHERE contract_id=$1
  `,
  [
    contractId,
    newOwnerId
  ]);
}

// INTERNAL: For use where a contract is either sold or the listing is removed
function _removeAskPrice(contractId: string | number, client: PoolClient) {
  return client.query(`
    UPDATE contracts
    SET ask_price=null
      WHERE contract_id=$1
  `,
  [
    contractId
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
export async function createContract(typeId: number, askPrice?: number, ownerId?: number) {
  let contractType = await getActiveContractTypeById(typeId);
  let unlockedPoolAssetTotal = await getUnlockedAmountByAssetId(contractType.assetId);
  if (unlockedPoolAssetTotal < contractType.assetAmount) throw new Error('Not enough unlocked assets to create contract');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const contract = (await client.query(`
      INSERT INTO contracts (
        type_id,
        owner_id,
        ask_price
      ) VALUES ($1, $2, $3)
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
      typeId,
      ownerId,
      askPrice
    ])).rows[0] as Contract;
    let pools = await getPoolsByAssetId(contractType.assetId);
    let poolLockPromises = [];
    let unallocatedAmount = contractType.assetAmount;
    // Okay, so this should create a pool lock for all pools with
    // Unlocked assets, cascading down until the contract is spent on locks
    for (let pool of pools) {
      let unlockedAmount = await getUnlockedAmountByPoolId(pool.poolId); // TODO: Could technically get locked amounts and do the sum here
      if (unlockedAmount > 0) {
        let allocatedAmount = unallocatedAmount >= unlockedAmount ? unlockedAmount : unallocatedAmount;
        poolLockPromises.push(
          _createPoolLock(
            pool.poolId,
            contract.contractId,
            allocatedAmount,
            contractType.expiresAt,
            client
          )
        );
        unallocatedAmount -= allocatedAmount;
        if (!unallocatedAmount) break; // Stops creating new pools when amount hits 0
      }
    }
    await Promise.all(poolLockPromises);
    let bids = await _getMatchingBidsByAsk(contract, client);
    if (bids.length > 0) await _tradeContract(contract, bids[0], client);
    await client.query('COMMIT');
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
  const client = await db.connect();
  try {
    client.query('BEGIN');
    const contract = (await client.query(`
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
    if (contract) {
      let bids = await _getMatchingBidsByAsk(contract, client);
      if (bids.length > 0) await _tradeContract(contract, bids[0], client);
    }
    await client.query('COMMIT');
  } catch (e) {
    console.log(e) // DEBUG
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

// For use where a contract is either sold or the listing is removed
export function removeAskPrice(contractId: string | number, accountId: string | number) {
  return db.query(`
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
export async function _tradeContract(contract: Contract, bid: Bid, client: PoolClient) {
  if (!contract.askPrice || !contract.contractId || !bid.bidId) throw new Error('I\'m afraid that just isn\'t possible'); // DEBUG
    let assetAmount = (await getActiveContractTypeById(contract.typeId)).assetAmount;
    let saleCost = contract.askPrice * assetAmount;
    let tradeFee = contract.ownerId ? // If the contract is being purchased from the AI, all proceeds go to the pool provider
      saleCost * poolFee : saleCost;
    let sellerProceeds = saleCost - tradeFee;
    let buyerId = bid.accountId;
    let sellerId = contract.ownerId;
    return Promise.all([
      withdrawPaper(buyerId, saleCost, client),
      sellerId && depositPaper(sellerId, sellerProceeds, client),
      _addToLockTradeFees(contract.contractId, tradeFee, client),
      _createTrade(
        contract.contractId,
        contract.typeId,
        buyerId,
        contract.askPrice,
        tradeFee,
        client,
        sellerId
      ),
      _removeBid(bid.bidId, client),
      _removeAskPrice(contract.contractId, client),
      _updateOwnerId(contract.contractId, buyerId, client)
    ]);
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
    // Ensure this is resolved before _sellPoolLockAssets and _distributePoolLockFees are invoked
    await _addToLockTradeFees(contract.contractId!, poolFee, client);
    await _sellPoolLockAssets(contract.contractId!, client);
    await depositPaper(contract.ownerId, saleProfits, client); // Provide contract owner / exerciser with remaining paper, which equates to (assetAmount * market price) - (assetAmount * strike price)
    if (contract.askPrice) { await _removeAskPrice(contract.contractId!, client); }
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
