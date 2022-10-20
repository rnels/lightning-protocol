import { PoolClient } from 'pg';
import db from '../db/db';
import { Bid, Contract, PoolLock, Trade } from '../types';
import { withdrawPaper, depositPaper } from './accountModel';
import { removeBid } from './bidModel';
import { getContractTypeById } from './contractTypeModel';
import {
   _createPoolLock,
  _distributeTradeFees,
  getPoolsByAssetId,
  getUnlockedAmountByAssetId,
  getUnlockedAmountByPoolId
} from './poolModel';
import { _createTrade } from './tradeModel';

// Finds matching bids with prices higher than or equal to the contract ask price
// If there are matches, executes a trade on the highest bid
// When this is called, there should be a bid in the table, don't call this before creating a bid
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
async function _getMatchingBidsByAsk(contract: Contract) {
  let bids = (await
    db.query(`
      SELECT *
        FROM bids
        WHERE type_id=$1
          AND bid_price>=$2
        ORDER BY bid_price DESC
    `, [contract.typeId, contract.askPrice])
  ).rows;
  if (bids.length === 0) return;
  let bid: Bid = {
    bidId: bids[0].bid_id,
    typeId: bids[0].type_id,
    accountId: bids[0].account_id,
    bidPrice: bids[0].bid_price,
    createdAt: bids[0].created_at
  }
  _tradeContract(contract, bid);
}

// TODO: Flesh this out as needed
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
function _updateExercised(contract: Contract, exercised: boolean) {
  return db.query(`
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

export function getAllContracts(sort='contract_id ASC', count=10) {
  return db.query(`
    SELECT *
      FROM contracts
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
}

export function getContractById(id: string | number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE contract_id=$1
  `, [id]);
}

export function getContractsByTypeId(typeId: string | number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE type_id=$1
  `, [typeId]);
}

export function getContractsByOwnerId(ownerId: string | number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE owner_id=$1
  `, [ownerId]);
}

// Creates a contract, locks in amounts to pools
// TODO: Create process of allocating fees, unlocking locked pools on contract expiry / exercise
export async function createContract(contract: Contract) {
  let contractType = (await getContractTypeById(contract.typeId)).rows[0];
  let unlockedPoolAssetTotal = await getUnlockedAmountByAssetId(contractType.asset_id);
  if (unlockedPoolAssetTotal < contractType.asset_amount) throw new Error('Not enough unlocked assets to create contract');
  let client = await db.connect();
  try {
    await client.query('BEGIN');
    let result = await client.query(`
      INSERT INTO contracts (
        type_id,
        owner_id,
        ask_price,
        exercised
      ) VALUES (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING contract_id
    `,
    [
      contract.typeId,
      contract.ownerId,
      contract.askPrice,
      contract.exercised
    ]);
    let contractId = result.rows[0].contract_id;
    contract.contractId = contractId;
    let pools = (await getPoolsByAssetId(contractType.asset_id)).rows;
    let poolLockPromises = [];
    let unallocatedAmount = contractType.asset_amount;
    // Okay, so this should create a pool lock for all pools with
    // Unlocked assets, cascading down until the contract is spent on locks
    for (let pool of pools) {
      let unlockedAmount = await getUnlockedAmountByPoolId(pool.pool_id); // TODO: Could technically get locked amounts and do the sum here
      if (unlockedAmount > 0) {
        let allocatedAmount = unallocatedAmount >= unlockedAmount ? unlockedAmount : unallocatedAmount;
        let poolLock: PoolLock = {
          poolId: pool.pool_id,
          contractId,
          assetAmount: allocatedAmount,
          expired: false
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

// TODO: Ensure someone can't set an ask price on exercised or expired contracts
export async function updateAskPrice(contractId: string | number, askPrice: number, ownerId: string | number) {
  let result = await db.query(`
    UPDATE contracts
    SET ask_price=$2
      WHERE contract_id=$1
        AND owner_id=$3
        AND exercised=false
    RETURNING *
  `,
  [
    contractId,
    askPrice,
    ownerId
  ]);
  let contractRow = result.rows[0];
  let contract: Contract = {
    contractId: contractRow.contract_id,
    typeId: contractRow.type_id,
    ownerId: contractRow.owner_id,
    askPrice: contractRow.ask_price,
    createdAt: contractRow.created_at,
    exercised: contractRow.exercised
  }
  _getMatchingBidsByAsk(contract);
  return result;
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
      sellerId: contract.ownerId,
      salePrice,
      tradeFee
    };
    await Promise.all([
      withdrawPaper(bid.accountId, salePrice, client),
      depositPaper(contract.ownerId, sellerProceeds, client),
      _distributeTradeFees(contract.contractId as number, tradeFee, client),
      _createTrade(trade, client),
      removeBid(bid.bidId as number, bid.accountId, client),
      removeAskPrice(contract.contractId as number, contract.ownerId, client),
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