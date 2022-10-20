import { PoolClient } from 'pg';
import db from '../db/db';
import { Bid, Contract, Pool, PoolLock, Trade } from '../types';
import { withdrawPaper, depositPaper } from './accountModel';
import { removeBid } from './bidModel';
import { getActiveContractTypeById, getContractTypeById } from './contractTypeModel';
import {
   _createPoolLock,
  _distributeTradeFees,
  getPoolsByAssetId,
  getUnlockedAmountByAssetId,
  getUnlockedAmountByPoolId,
  _removePoolLocksByContractId
} from './poolModel';
import { _createTrade } from './tradeModel';
import { getAssetPrice } from '../prices/getPrices';
import { getAssetById } from './assetModel';

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
function _updateExercised(contract: Contract, exercised: boolean, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  return query(`
    UPDATE contracts
    SET exercised=$2
      WHERE contract_id=$1
  `,
  [
    contract.contractId,
    exercised
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

export async function getAllContracts(sort='contract_id ASC'): Promise<Contract[]> {
  const res = await db.query(`
    SELECT
      contract_id as "contractId",
      type_id as "typeId",
      owner_id as "ownerId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised
    FROM contracts
      ORDER BY $1
  `, [sort]);
  return res.rows;
}

// TODO: Consider using aliases to select data with the typescript type schema
// i.e. SELECT contract_id as contractId
export async function getContractById(id: string | number): Promise<Contract> {
  const res = await db.query(`
    SELECT
      contract_id as "contractId",
      type_id as "typeId",
      owner_id as "ownerId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised
    FROM contracts
      WHERE contract_id=$1
  `, [id]);
  return res.rows[0];
}

export async function getContractsByTypeId(typeId: string | number): Promise<Contract[]> {
  const res = await db.query(`
    SELECT
      contract_id as "contractId",
      type_id as "typeId",
      owner_id as "ownerId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised
    FROM contracts
      WHERE type_id=$1
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
      exercised
    FROM contracts
      WHERE owner_id=$1
  `, [ownerId]);
  return res.rows;
}

// Creates a contract, locks in amounts to pools
// Creating a contract does not assign it an owner by default, since they're not created by people
// Just requires a type and an ask price
// Only accepting owner_id for debug atm
// TODO: Create process of allocating fees, unlocking locked pools on contract expiry / exercise
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
    await _getMatchingBidsByAsk(contract);
    client.release();
  } catch (e) {
    console.log(e); // DEBUG
    await client.query('ROLLBACK');
    client.release();
    throw new Error('Contract could not be created');
  }
}

// TODO: Ensure someone can't set an ask price on expired contracts
export async function updateAskPrice(contractId: string | number, askPrice: number, ownerId: string | number): Promise<Contract> {
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
      exercised
  `,
  [
    contractId,
    askPrice,
    ownerId
  ])).rows[0] as Contract;
  _getMatchingBidsByAsk(contract);
  return contract;
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
  let salePrice = contract.askPrice!;
  let client = await db.connect();
  try {
    await client.query('BEGIN');
    let tradeFee = salePrice * 0.01; // TODO: Don't hardcode the 1% fee
    let sellerProceeds = salePrice - tradeFee;
    let trade: Trade = {
      contractId: contract.contractId as number,
      buyerId: bid.accountId,
      sellerId: contract.ownerId!,
      salePrice,
      tradeFee
    };
    await Promise.all([
      withdrawPaper(bid.accountId, salePrice, client),
      depositPaper(contract.ownerId!, sellerProceeds, client),
      _distributeTradeFees(contract.contractId as number, tradeFee, client),
      _createTrade(trade, client),
      removeBid(bid.bidId as number, bid.accountId, client),
      removeAskPrice(contract.contractId as number, contract.ownerId!, client),
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
// Removes locks (TODO: Make sure locks are removed on contract expiry as well, which will be kind of tough, requires a listener of some kind)
// Distributes locked funds
// TODO: Treat compensation / exercising differently if it's a put rather than a call, currently operating as if it's just a call
export async function exerciseContract(contractId: string | number, ownerId: string | number) {
  let contract = (await db.query(`
    SELECT
      contract_id as "contractId",
      type_id as "typeId",
      owner_id as "ownerId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised
    FROM contracts
      WHERE contract_id=$1
        AND owner_id=$2
  `,[contractId, ownerId])).rows[0] as Contract; // Should return an error if the contract can't be found with the contractId and ownerId
  if (contract.exercised) throw new Error('Contract has already been exercised');
  let contractType = await getActiveContractTypeById(contract.typeId); // Should return an error if the contract is past expiry
  let asset = await getAssetById(contractType.assetId);
  let assetPrice = await getAssetPrice(asset.priceApiId!, asset.assetType);
  if (assetPrice < contractType.strikePrice) {
    throw new Error('Contract with asset market price under strike price can not be exercised');
  }
  let client = await db.connect();
  try {
    await client.query('BEGIN');
    // TODO: DISTRIBUTE POOL LOCK PAYOUTS TO POOL OWNERS
    await _removePoolLocksByContractId(contractId as number, client); // Ensure that pool lock amounts are distributed before calling this
    // TODO:
    // - Sell pool assets at market price
    // - Provide pool owner with paper equating to the assetAmount * strike price
    // - Provide contract owner / exerciser with remaining paper, which equates to (assetAmount * market price) - (assetAmount * strike price)

    await _updateExercised(contract, true, client)
    await client.query('COMMIT');
  } catch(e) {
    console.log(e); // DEBUG
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}