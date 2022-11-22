import { PoolClient, QueryResult } from 'pg';
import db from '../db/db';
import { Bid, Contract } from '../types';
import { withdrawPaper, depositPaper } from './accountModel';
import { _removeBid } from './bidModel';
import { getActiveContractTypeById } from './contractTypeModel';
import {
   _createPoolLock,
  _addToLockTradeFees,
  getUnlockedAmountByAssetId,
  getUnlockedAmountByPoolId,
  _deletePoolLocksByContractId,
  _addToPoolLockReserve,
  _takeFromPoolLockReserve,
  _getPoolsByAssetIdForUpdate
} from './poolModel';
import { getTradesByContractIdAccountId, _createTrade } from './tradeModel';
import { getAssetPriceFromAPI } from '../assets/price';
import { getAssetById } from './assetModel';

const poolFee = 0.01;

// Finds matching bids with prices higher than or equal to the contract ask price
// If there are matches, executes a trade on the highest bid
// When this is called, there should be a bid in the table, don't call this before creating a bid
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
async function _getMatchingBidsByAsk(
  contract: Contract,
  client: PoolClient
) {
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
      FOR UPDATE
    `, [contract.typeId, contract.askPrice])
  ).rows as Bid[];
  return bids;
}

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
async function _setExercised(
  contract: Contract,
  exercisedAmount: number,
  client: PoolClient
) {
  let contractId = (await client.query(`
    UPDATE contracts
    SET
      exercised=true,
      exercised_amount=$2
    WHERE contract_id=$1
    RETURNING contract_id as "contractId"
  `,
  [
    contract.contractId,
    exercisedAmount
  ])).rows[0].contractId;
  if (!contractId) throw new Error('No unexercised contract exists with this contractId');
  return;
}

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
function _updateOwnerId(
  contractId: number,
  newOwnerId: number,
  client: PoolClient
) {
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

// INTERNAL: For use by the Writer only
export async function _writerUpdateAskPrice(
  contractId: number,
  askPrice: number
) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const contract = (await client.query(`
      UPDATE contracts
      SET ask_price=$2
        WHERE contract_id=$1
        AND owner_id IS NULL
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
      askPrice
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

// INTERNAL: For use where a contract is either sold or the listing is removed
function _removeAskPrice(
  contractId: string | number,
  client: PoolClient
) {
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
async function _getContractById(id: string | number, client?: PoolClient): Promise<Contract> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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

async function _getContractByIdForUpdate(id: string | number, client?: PoolClient): Promise<Contract> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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
    FOR UPDATE
  `, [id]);
  return res.rows[0];
}

export async function getContractById(id: string | number, client?: PoolClient): Promise<Contract> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  let res: QueryResult;
  try {
    res = await query(`
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
  } catch {
    throw new Error(`There was an error retrieving the contract`);
  }
  if (res.rows.length === 0) throw new Error(`Contract with contractId ${id} does not exist`);
  return res.rows[0];
}

// TODO: Make this less janky looking
export async function getContractOwnedByIdExt(contractId: string | number, accountId: string | number): Promise<Contract> {
  let contract = await getContractById(contractId);
  contract.trades = await getTradesByContractIdAccountId(contract.contractId, accountId);
  return contract;
}

export async function getContractsByTypeId(typeId: string | number): Promise<Contract[]> {
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
  `, [typeId]);
  return res.rows;
}

export async function getContractsByTypeIdOwnerId(typeId: string | number, ownerId: string | number): Promise<Contract[]> {
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
        AND owner_id=$2
  `, [typeId, ownerId]);
  return res.rows;
}

/** Number of contracts represents "Open Interest" */
export async function getActiveContractsByTypeId(typeId: string | number, client?: PoolClient): Promise<Contract[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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

export async function getActiveContractsByTypeIdAndOwnerId(typeId: string | number, ownerId: string | number, client?: PoolClient): Promise<Contract[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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
        AND owner_id=$2
        AND exercised=false
  `, [typeId, ownerId]);
  return res.rows;
}

export async function getContractsByOwnerId(ownerId: string | number, client?: PoolClient): Promise<Contract[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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
export async function createContract(
  typeId: number,
  askPrice?: number
): Promise<Contract> {
  const client = await db.connect()
  try {
    await client.query('BEGIN');
    // NOTE: Commented this out since I seemed to have figured out a better way, but uncomment if the problem shows up again for some reason
    // await client.query('LOCK TABLE contracts IN EXCLUSIVE MODE'); // NOTE: This stops concurrent creation issue where too many pool locks are created, but I will probably want to find a better way
    let contractType = await getActiveContractTypeById(typeId, client);
    let asset = await getAssetById(contractType.assetId, client);
    let unallocatedAmount = Number(asset.assetAmount);
    let unlockedPoolAssetTotal = await getUnlockedAmountByAssetId(asset.assetId, client);
    if (unlockedPoolAssetTotal < unallocatedAmount) throw new Error('Not enough unlocked assets to create contract (1)');
    const contract = (await client.query(`
      INSERT INTO contracts (
        type_id,
        ask_price
      ) VALUES ($1, $2)
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
      askPrice
    ])).rows[0] as Contract;
    let pools = await _getPoolsByAssetIdForUpdate(asset.assetId, client);
    let poolLockPromises = [];
    // Okay, so this should create a pool lock for all pools with
    // unlocked assets, cascading down until the contract is spent on locks
    for (let pool of pools) {
      let unlockedAmount = await getUnlockedAmountByPoolId(pool.poolId, client);
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
        // NOTE: Using this small amount to prevent rounding errors
        if (unallocatedAmount <= 0.0000001) break; // Stops creating new pools when amount hits 0
      }
    }
    if (unallocatedAmount > 0.0000001) throw new Error('Not enough unlocked assets to create contract (2)'); // NOTE: Not strictly needed, mostly for debugging, but can stop a contract from being created without enough backing assets if pool amounts were withdrawn during the course of this (though I've locked pools for update so it can't happen now)
    await Promise.all(poolLockPromises);
    if (askPrice) {
      let bids = await _getMatchingBidsByAsk(contract, client);
      if (bids.length > 0) await _tradeContract(contract, bids[0], client);
    }
    await client.query('COMMIT');
    client.release();
    return contract;
  } catch (e) {
    await client.query('ROLLBACK');
    client.release();
    console.log(e); // DEBUG
    throw new Error('There was an error creating the contract'); // TODO: Create detailed error messages
  }
}

export async function updateAskPrice(contractId: string | number, askPrice: number, ownerId: string | number) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
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
    if (!contract) {
      throw new Error('Contract could not be found');
    }
    await getActiveContractTypeById(contract.typeId); // Should throw exception is contract type is expired
    let bids = await _getMatchingBidsByAsk(contract, client);
    if (bids.length > 0) await _tradeContract(contract, bids[0], client);
    await client.query('COMMIT');
    client.release();
  } catch (e: any) {
    await client.query('ROLLBACK');
    client.release();
    console.log(e) // DEBUG
    throw new Error(e);
  }
}

export function removeAskPrice(
  contractId: string | number,
  accountId: string | number
) {
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
// TODO: Put in protections against trading with own account(?)
export async function _tradeContract(
  contract: Contract,
  bid: Bid,
  client: PoolClient
) {
  let askPrice = Number(contract.askPrice);
  if (!askPrice) throw new Error('I\'m afraid that just isn\'t possible'); // DEBUG
  let contractType = await getActiveContractTypeById(contract.typeId, client);
  let asset = await getAssetById(contractType.assetId, client);
  let saleCost = Number(askPrice) * Number(asset.assetAmount);
  let tradeFee = contract.ownerId ? // If the contract is being purchased from the AI, all proceeds go to the pool provider
    saleCost * poolFee : saleCost;
  let buyerId = bid.accountId;
  let sellerId = contract.ownerId;
  return Promise.all([
    withdrawPaper(buyerId, saleCost, client),
    sellerId && depositPaper(sellerId, saleCost - tradeFee, client),
    _addToLockTradeFees(contract.contractId, tradeFee, client),
    _createTrade(
      contract.contractId,
      contract.typeId,
      buyerId,
      askPrice,
      saleCost,
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
// NOTES on put options:
// They work differently from calls because there needs to be the liquidity to trade when the contract is exercised ITM, meaning the asset needs to be sold beforehand at or above the strike price. Instead of selling the underlying asset as soon as the put is assigned to a pool, it would be better to put on a stop-limit order with the limit set at a margin above the strike, i.e. stop-limit for 31 - 30 for a strike of 30. Could also back it up with a stop-loss order if the limit order fails, and have some way to back the difference if there is any. The stop limit/loss would expire after the contract expiry date (or it could just be represented by the pool lock). This is a riskier method than just selling the asset at market price when a position is opened on the pool and forwarding the strike price * asset amount to the exerciser when it's exercised, but it means that the pool owner would have their assets sold at a potentially lower price than they would be at if the option is not exercised, missing out on unrealized gains.
// If I go with the first method, I better have a loss prevention fund to round out potentially failed limit orders
// TODO: Test to ensure you can't exercise the same contract multiple times using concurrent operations or anything else
export async function exerciseContract(
  contractId: number,
  ownerId: number
) {
  let client = await db.connect();
  try {
    await client.query('BEGIN');
    let contract = await _getContractByIdForUpdate(contractId, client);
    if (contract.ownerId !== ownerId) {
      throw new Error('Provided ownerId does not match contract.ownerId');
    }
    if (contract.exercised) {
      throw new Error('Contract has already been exercised');
    }
    let contractType = await getActiveContractTypeById(contract.typeId, client);
    if (!contractType) {
      throw new Error('Active contractType could not be found');
    }
    let asset = await getAssetById(contractType.assetId, client);
    // TODO: Consider if we want to be calling to this directly, or call to assetModel to update and use assets.last_price here
    // Maybe have a stricter requirement when exercising that the asset price must have been updated within the last 10 seconds or something
    // For the real implementation on the blockchain this won't really matter (nor will getting price from an API at all)
    let assetPrice = await getAssetPriceFromAPI(asset.priceApiId, asset.assetType); // Not catching potential error on getAssetPriceFromAPI on purpose
    if (contractType.direction && assetPrice < contractType.strikePrice) {
      throw new Error('Call option with asset market price under strike price can not be exercised');
    } else if (!contractType.direction && assetPrice > contractType.strikePrice) {
      throw new Error('Put option with asset market price above strike price can not be exercised');
    }
    var saleProfits: number;
    let assetAmount = Number(asset.assetAmount);
    let strikePrice = Number(contractType.strikePrice);
    var poolReserves = strikePrice * assetAmount;
    if (contractType.direction) { // If direction = call
      // Provide contract owner / exerciser with remaining paper, which equates to (assetAmount * market price) - (assetAmount * strike price)
      saleProfits = (assetPrice * assetAmount) - poolReserves;
      // Add to reserve_amount for pool_locks paper equating to the assetAmount * strike price
      await _addToPoolLockReserve(contract.contractId, strikePrice, client);
    } else { // If direction = put
      saleProfits = poolReserves - (assetPrice * assetAmount);
      await _takeFromPoolLockReserve(contract.contractId, strikePrice, client);
    }
    await _deletePoolLocksByContractId(contract.contractId, client);
    await depositPaper(contract.ownerId, saleProfits, client);
    if (contract.askPrice) { await _removeAskPrice(contract.contractId, client); }
    await _setExercised(contract, saleProfits, client);
    await client.query('COMMIT');
    client.release();
  } catch (e: any) {
    console.log(e); // DEBUG
    await client.query('ROLLBACK');
    client.release();
    throw new Error(e);
  }
}

export async function _writerGetContractsByTypeId(typeId: string | number): Promise<Contract[]> {
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
        AND owner_id IS NULL
  `, [typeId]);
  return res.rows;
}