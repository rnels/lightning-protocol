import { PoolClient, QueryResult } from 'pg';
import db from '../db/db';
import { Pool, PoolLock } from '../types';
import { depositPaper } from './accountModel';
import { getAssetById, getAssetPriceById } from './assetModel';
import { getContractById, isContractActive } from './contractModel';
import { getActiveContractTypeById, getContractTypeById } from './contractTypeModel';

// TODO: Set this up to be called by a listener periodically
// TODO: Consider setting up a new state where pools are unlocked but also can not be re-assigned to within a "cooldown" window
// async function _removeExpiredPoolLocks() {
//   let feePromises = [];
//   let client = await db.connect();
//   try {
//     await client.query('BEGIN')
//     let deletePoolLocks = (await client.query(`
//       DELETE FROM pool_locks
//         WHERE expires_at <= NOW()
//           RETURNING
//             pool_id as "poolId",
//             reserve_amount as "reserveAmount",
//             reserve_credit as "reserveCredit"
//     `)).rows;
//     for (let poolLock of deletePoolLocks) {
//       let pool = await getPoolById(poolLock.poolId, client);
//       feePromises.push(
//         client.query(`
//           UPDATE accounts
//           SET paper=paper+$2
//             WHERE account_id=$1
//         `, [pool.accountId, Number(poolLock.tradeFees) + Number(poolLock.reserveAmount) - Number(poolLock.reserveCredit)])
//       );
//     }
//     await Promise.all(feePromises);
//     await client.query('COMMIT');
//   } catch {
//     await client.query('ROLLBACK');
//   } finally {
//     client.release();
//   }
// }

// BIG TODO: RELEASE POOL LOCKS FOR EXPIRED CONTRACTS

/** Removes lock by setting released to true */
async function _setReleased(poolLock: PoolLock, client: PoolClient) {
  client.query(`
    UPDATE pool_locks
      SET released=true
    WHERE pool_lock_id=$1
  `, [poolLock.poolLockId]);
}

// TODO: It's possible that if I set an incremented period from expires_at when comparing to NOW(), I can create a buffer where the lock has expired, but new contract creation still considers it locked since there's that incremental period between expiry and NOW(). For example, saying AND expires_at + (PERIOD) > NOW() means they will be left out of the "locked amount". If I allow users to claim locked_pools which have gone past their expiry but remain within this period, this also gives us a manual way to clear out pool locks, by having users "claim" the locked amounts to add them back to their pool (given the option to either return the assets to their pool or withdraw them completely), deleting the lock in the process. In order to clear out pools that have gone past the cooldown however, this still requires some kind of automated cleaning process. Since the locks are being reviewed at the time of contract creation, perhaps ones that are past expiry + interval can just be deleted. This can piggyback the creation contracts. In fact, it basically just means calling _deleteExpiredLocks right before a contract is to be created. I just need to add that period / interval buffer once I decide on it, so it works properly (and anywhere else which compares expires_at to NOW())
async function _getLockedAmountByPoolId(id: string | number, client?: PoolClient): Promise<number> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
        WHERE pool_id=$1
        AND released=false
  `, [id]);
  return Number(res.rows[0].sum);
}

async function _getLockedAmountSumByContractId(contractId: number, client?: PoolClient): Promise<number> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  let isActive = await isContractActive(contractId);
  if (!isActive) return 0;
  const res = await query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
        WHERE contract_id=$1
        AND released=false
  `, [contractId]);
  return Number(res.rows[0].sum);
}

async function _getLockedAmountSumByAssetId(assetId: string | number, client?: PoolClient): Promise<number> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT SUM(pool_locks.asset_amount)
      FROM pools, pool_locks
        WHERE pools.asset_id=$1
          AND pool_locks.pool_id=pools.pool_id
          AND pool_locks.released=false
  `, [assetId]);
  return Number(res.rows[0].sum);
}

async function _getTotalAmountSumByAssetId(assetId: string | number, client?: PoolClient): Promise<number> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT SUM(asset_amount)
      FROM pools
        WHERE asset_id=$1
  `, [assetId]);
  return Number(res.rows[0].sum);
}

async function _doesPoolExist(accountId: number, assetId: number, client?: PoolClient): Promise<boolean> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT EXISTS(
      SELECT pool_id
        FROM pools
        WHERE account_id=$1
          AND asset_id=$2
    )
  `, [accountId, assetId]);
  return Boolean(res.rows[0].exists);
}

export async function _getLockedPoolsByContractId(contractId: number, client?: PoolClient): Promise<PoolLock[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      pool_lock_id as "poolLockId",
      pool_id as "poolId",
      contract_id as "contractId",
      asset_amount as "assetAmount",
      reserve_amount as "reserveAmount",
      contract_asset_amount as "contractAssetAmount",
      reserve_credit as "reserveCredit",
      premium_fee as "premiumFee",
      trade_fees as "tradeFees",
      released
    FROM pool_locks
      WHERE contract_id=$1
  `, [contractId]);
  return res.rows;
}

/** Updates trade_fees on pool_locks for given contractId, deposits paper amount to account */
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _addToLockTradeFees(contractId: number, tradeFee: number, client: PoolClient) {
  let feePromises = [];
  let poolLocks = await _getLockedPoolsByContractId(contractId, client);
  let totalAssetAmount = await _getLockedAmountSumByContractId(contractId, client);
  for (let poolLock of poolLocks) {
    let fee = tradeFee * (Number(poolLock.contractAssetAmount) / totalAssetAmount);
    let pool = await getPoolById(poolLock.poolId);
    feePromises.push(
      client.query(`
        UPDATE pool_locks
        SET trade_fees=trade_fees+$2
          WHERE pool_lock_id=$1
      `, [poolLock.poolLockId, fee]),
      depositPaper(pool.accountId, fee, client)
    );
  }
  return Promise.all(feePromises);
}

// TODO: Have this called when a contract expires
/** Called when a contract expires or is exercised */
export async function _addToLockPremium(contractId: number, premiumFee: number, client: PoolClient) {
  let feePromises = [];
  let poolLocks = await _getLockedPoolsByContractId(contractId, client);
  let totalAssetAmount = await _getLockedAmountSumByContractId(contractId, client);
  for (let poolLock of poolLocks) {
    let fee = premiumFee * (Number(poolLock.contractAssetAmount) / totalAssetAmount);
    let pool = await getPoolById(poolLock.poolId);
    feePromises.push(
      client.query(`
        UPDATE pool_locks
        SET premium_fee=$2
          WHERE pool_lock_id=$1
      `, [poolLock.poolLockId, fee]),
      depositPaper(pool.accountId, fee, client)
    );
  }
  return Promise.all(feePromises);
}

/** Adds to reserve_amount on pool_locks for given contractId. Decreases pools.asset_amount by pool_lock.asset_amount. Used in exercising calls */
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _addToPoolLockReserve(contractId: number, strikePrice: number, client: PoolClient) {
  let reservePromises = [];
  let poolLocks = await _getLockedPoolsByContractId(contractId, client);
  for (let poolLock of poolLocks) {
    let reserveAmount = strikePrice * Number(poolLock.assetAmount);
    reservePromises.push(
      client.query(`
        UPDATE pool_locks
        SET
          reserve_amount=reserve_amount+$2,
          asset_amount=0
        WHERE pool_lock_id=$1
      `, [poolLock.poolLockId, reserveAmount]),
      client.query(`
        UPDATE pools
          SET asset_amount=asset_amount-$2
            WHERE pool_id=$1
      `,[poolLock.poolId, poolLock.assetAmount])
    );
  }
  return Promise.all(reservePromises);
}

/** Subtracts reserve_amount on pool_locks for given contractId. Used in exercising puts */
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _takeFromPoolLockReserve(contractId: number, strikePrice: number, client: PoolClient) {
  let reservePromises = [];
  let poolLocks = await _getLockedPoolsByContractId(contractId, client);
  for (let pool of poolLocks) {
    let reserveAmount = strikePrice * Number(pool.contractAssetAmount);
    console.log('reserveAmount:', reserveAmount)
    reservePromises.push(
      client.query(`
        UPDATE pool_locks
        SET reserve_amount=reserve_amount-$2
          WHERE pool_lock_id=$1
      `, [pool.poolLockId, reserveAmount])
    );
  }
  return Promise.all(reservePromises);
}

// Allows you to convert reserves into assets
// TODO: Create
export async function _convertPoolReserve(poolId: number, client: PoolClient) {

}

export async function getUnlockedAmountByPoolId(id: string | number, client?: PoolClient): Promise<number> {
  let results = await Promise.all([
    _getLockedAmountByPoolId(id, client),
    getPoolById(id, client)
  ]);
  let lockedAmount = results[0];
  let totalAmount = Number(results[1].assetAmount);
  return totalAmount - lockedAmount;
}

export async function getUnlockedAmountByAssetId(assetId: string | number, client?: PoolClient): Promise<number> {
  let results = await Promise.all([
    _getLockedAmountSumByAssetId(assetId, client),
    _getTotalAmountSumByAssetId(assetId, client)
  ]);
  let lockedAmount = results[0];
  let totalAmount = results[1];
  return totalAmount - lockedAmount;
}

export async function getAllPools(sort='pool_id ASC', client?: PoolClient): Promise<Pool[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount"
    FROM pools
    ORDER BY $1
  `, [sort]);
  return res.rows;
}

// NOTE: Changed to return pool locks as well
export async function getPoolById(id: string | number, client?: PoolClient): Promise<Pool> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  let res: QueryResult;
  try {
    res = await query(`
      SELECT
        pool_id as "poolId",
        account_id as "accountId",
        asset_id as "assetId",
        asset_amount as "assetAmount"
      FROM pools
      WHERE pool_id=$1
    `, [id]);
  } catch {
    throw new Error('There was an error retrieving the pool');
  }
  if (res.rows.length === 0) throw new Error(`Pool with poolId ${id} does not exist`);
  let pool: Pool = res.rows[0];
  pool.poolLocks = await getPoolLocksByPoolId(pool.poolId);
  return pool;
}

export async function getPoolLockById(id: string | number, accountId: string | number, client?: PoolClient): Promise<PoolLock> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  let res: QueryResult;
  try {
    res = await query(`
      SELECT
        pool_locks.pool_lock_id as "poolLockId",
        pool_locks.pool_id as "poolId",
        pool_locks.contract_id as "contractId",
        pool_locks.asset_amount as "assetAmount",
        pool_locks.contract_asset_amount as "contractAssetAmount",
        pool_locks.reserve_amount as "reserveAmount",
        pool_locks.reserve_credit as "reserveCredit",
        pool_locks.premium_fee as "premiumFee",
        pool_locks.trade_fees as "tradeFees",
        pool_locks.released as "released"
      FROM pool_locks, pools
        WHERE
          pool_locks.pool_lock_id=$1
        AND
          pools.account_id=$2

    `, [id, accountId]);
  } catch {
    throw new Error('There was an error retrieving the pool lock');
  }
  if (res.rows.length === 0) throw new Error(`Pool lock with poolLockId ${id} does not exist`);
  let poolLock: PoolLock = res.rows[0];
  return poolLock;
}

export async function getPoolByAccountAssetIds(accountId: string | number, assetId: string | number, client?: PoolClient): Promise<Pool> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  let res: QueryResult;
  try {
    res = await query(`
      SELECT
        pool_id as "poolId",
        account_id as "accountId",
        asset_id as "assetId",
        asset_amount as "assetAmount"
      FROM pools
        WHERE account_id=$1
          AND asset_id=$2
      `, [accountId, assetId]);
  } catch {
    throw new Error('There was an error retrieving the pool');
  }
  if (res.rows.length === 0) throw new Error(`Pool does not exist`);
  let pool: Pool = res.rows[0];
  pool.poolLocks = await getPoolLocksByPoolId(pool.poolId);
  return pool;
}

export async function getPoolsByAssetId(assetId: string | number, client?: PoolClient): Promise<Pool[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount"
    FROM pools
      WHERE asset_id=$1
  `, [assetId]);
  return res.rows;
}

export async function _getPoolsByAssetIdForUpdate(assetId: string | number, client?: PoolClient): Promise<Pool[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount"
    FROM pools
      WHERE asset_id=$1
    FOR UPDATE
  `, [assetId]);
  return res.rows;
}

export async function getPoolAssetsByAssetId(assetId: string | number, client?: PoolClient): Promise<number> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      SUM(asset_amount)
    FROM pools
      WHERE asset_id=$1
  `, [assetId]);
  return Number(res.rows[0].sum);
}

export async function getPoolsByAccountId(accountId: string | number, client?: PoolClient): Promise<Pool[]> {
  const res = await db.query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount"
    FROM pools
      WHERE account_id=$1
  `, [accountId]);
  return res.rows;
}

// NOTE: Includes released locks
export async function getPoolLocksByPoolId(id: string | number, client?: PoolClient): Promise<PoolLock[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      pool_lock_id as "poolLockId",
      pool_id as "poolId",
      contract_id as "contractId",
      asset_amount as "assetAmount",
      contract_asset_amount as "contractAssetAmount",
      reserve_amount as "reserveAmount",
      reserve_credit as "reserveCredit",
      premium_fee as "premiumFee",
      trade_fees as "tradeFees",
      released
    FROM pool_locks
      WHERE pool_id=$1
  `, [id]);
  return res.rows;
}

// NOTE: Includes released locks
export async function getPoolLocksByAccountId(accountId: string | number, client?: PoolClient): Promise<PoolLock[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      pool_locks.pool_lock_id as "poolLockId",
      pool_locks.pool_id as "poolId",
      pool_locks.contract_id as "contractId",
      pool_locks.asset_amount as "assetAmount",
      pool_locks.contract_asset_amount as "contractAssetAmount",
      pool_locks.reserve_amount as "reserveAmount",
      pool_locks.reserve_credit as "reserveCredit",
      pool_locks.premium_fee as "premiumFee",
      pool_locks.trade_fees as "tradeFees",
      pool_locks.released as "released"
    FROM pools, pool_locks
      WHERE pools.account_id=$1
        AND pool_locks.pool_id=pools.pool_id
  `, [accountId]);
  return res.rows;
}

// NOTE: Only get active locks
export async function getPoolLockAssetsByAssetId(assetId: string | number, client?: PoolClient): Promise<number> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      SUM(pool_locks.asset_amount)
    FROM pools, pool_locks
      WHERE pools.asset_id=$1
        AND pool_locks.pool_id=pools.pool_id
        AND pool_locks.released=false
  `, [assetId]);
  return Number(res.rows[0].sum);
}

export async function createPool(
  accountId: number,
  assetId: number,
  assetAmount: number
): Promise<{poolId: number}> {
  if (await _doesPoolExist(accountId, assetId)) { throw new Error('Pool already exists'); }
  const res = await db.query(`
    INSERT INTO pools (
      account_id,
      asset_id,
      asset_amount
    ) VALUES (
      $1,
      $2,
      $3
    )
    RETURNING pool_id as "poolId"
  `,
  [
    accountId,
    assetId,
    assetAmount
  ]);
  return res.rows[0];
}

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export function _createPoolLock(
  poolId: number,
  contractId: number,
  assetAmount: number,
  client: PoolClient
) {
  return client.query(`
    INSERT INTO pool_locks (
      pool_id,
      contract_id,
      asset_amount,
      contract_asset_amount,

    ) VALUES ($1, $2, $3, $4)
  `,
  [
    poolId,
    contractId,
    assetAmount,
    assetAmount
  ]);
}

/** Releases pool_locks with the given contract_id, forwarding reserve_amount to respective pool provider */
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
// TODO: Currently not charging on the credit that's created, decide how I want to do this
// Will probably end up creating an account that holds 'emergency funds' for which to draw from for reserveCredit
export async function _releasePoolLockFeesByContractId(contractId: number, client: PoolClient) {
  let feePromises = [];
  let poolLocks = (await client.query(`
    SELECT
      pool_id as "poolId",
      reserve_amount as "reserveAmount",
      reserve_credit as "reserveCredit"
    FROM pool_locks
      WHERE contract_id=$1
        AND released=false
  `, [contractId])).rows;
  for (let poolLock of poolLocks) {
    let pool = await getPoolById(poolLock.poolId, client);
    feePromises.push(
      client.query(`
        UPDATE accounts
        SET paper=paper+$2
          WHERE account_id=$1
      `, [pool.accountId, Number(poolLock.reserveAmount) - Number(poolLock.reserveCredit)]),
      _setReleased(poolLock, client)
    );
  }
  return Promise.all(feePromises);
}

export async function withdrawPoolAssets(
  poolId: string | number,
  assetAmount: number,
  accountId: string | number
): Promise<{assetId: number}> {
  let unlockedAmount = await getUnlockedAmountByPoolId(poolId);
  if (unlockedAmount < assetAmount) throw new Error('Unlocked balance is not enough to withdraw this amount');
  const res = await db.query(`
    UPDATE pools
    SET asset_amount=asset_amount-$2
      WHERE pool_id=$1
        AND account_id=$3
    RETURNING asset_id as "assetId"
  `,
  [
    poolId,
    assetAmount,
    accountId
  ]);
  return res.rows[0];
}

// TODO: Create pool if it doesn't yet exist, change createPool to be internal
// TODO: Hook this method with contract writer to attempt to write new contracts from the queue on the depositing of pool assets
// NOTE: As of now there's no limit on depositing assets, you can just define a number of assets to deposit
// This is for the paper model, for the bc model it will be wallet based
export function depositPoolAssets(
  poolId: string | number,
  assetAmount: number,
  accountId: string | number
) {
  return db.query(`
    UPDATE pools
    SET asset_amount=asset_amount+$2
      WHERE pool_id=$1
        AND account_id=$3
  `,
  [
    poolId,
    assetAmount,
    accountId
  ]);
}

// export async function withdrawPoolLockFees(
//   poolLockId: string | number,
//   accountId: string | number
// ) {
//   let client = await db.connect();
//   try {
//     await client.query('BEGIN');
//     let poolLock = await getPoolLockById(poolLockId as number, accountId, client);
//     await Promise.all([
//       client.query(`
//         UPDATE pool_locks
//         SET trade_fees=0
//           WHERE pool_lock_id=$1
//             AND account_id=$2
//       `, [poolLock.poolLockId, accountId]),
//       depositPaper(accountId, poolLock.tradeFees as number, client)
//     ])
//     await client.query('COMMIT');
//     client.release();
//   } catch(e) {
//     console.log(e); // DEBUG
//     await client.query('ROLLBACK');
//     client.release();
//     throw new Error('There was an error withdrawing pool fees');
//   }
// }

// export async function withdrawAllPoolLockFees(
//   poolId: string | number,
//   accountId: string | number
// ) {
//   let poolLocks = await getPoolLocksByPoolId(poolId);
//   let withdrawPromises = [];
//   for (let lock of poolLocks) {
//     withdrawPromises.push(
//       withdrawPoolLockFees(lock.poolLockId, accountId)
//     );
//   }
//   return Promise.all(withdrawPromises);
// }

// TODO: Restrict the ability to re-assign to self
export async function reassignPoolLock(
  poolLockId: string | number,
  accountId: string | number
) {
  const client = await db.connect()
  try {
    await client.query('BEGIN');
    let poolLock = await getPoolLockById(poolLockId, accountId, client);
    let contract = await getContractById(poolLock.contractId, client);
    let contractType = await getActiveContractTypeById(contract.typeId, client);
    let asset = await getAssetById(contractType.assetId, client);
    let assetPrice = await getAssetPriceById(asset.assetId, client);
    let strikePrice = Number(contractType.strikePrice);
    let priceDif = (assetPrice - strikePrice) / strikePrice; // Decimal representing difference between asset price and strike
    if ((contractType.direction === false && priceDif < 0.05) || (contractType.direction === true && priceDif > 0.05)) {
      throw new Error('Can\'t reassign pool lock at this asset price');
    }
    let unallocatedAmount = Number(poolLock.contractAssetAmount); // NOTE: Uses contractAssetAmount so that assetAmount converted to reserves can be sent back to the pool owner, correct amount is used for unallocatedAmount
    // TODO: Consolidate this logic into a shared function, currently re-using code from _createContract
    let unlockedPoolAssetTotal = await getUnlockedAmountByAssetId(asset.assetId, client);
    if (unlockedPoolAssetTotal < unallocatedAmount) throw new Error('Not enough unlocked assets to reassign lock');
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
            client
          )
        );
        unallocatedAmount -= allocatedAmount;
        // NOTE: Using this small amount to prevent rounding errors
        if (unallocatedAmount <= 0.0000001) break; // Stops creating new pools when amount hits 0
      }
    }
    if (unallocatedAmount > 0.0000001) throw new Error('Not enough unlocked assets to reassign lock'); // NOTE: Not strictly needed, mostly for debugging, but can stop a contract from being created without enough backing assets if pool amounts were withdrawn during the course of this (though I've locked pools for update so it can't happen now)
    await Promise.all(poolLockPromises);
    await _setReleased(poolLock, client);
    await client.query('COMMIT');
    client.release();
  } catch (e) {
    await client.query('ROLLBACK');
    client.release();
    console.log(e); // DEBUG
    throw new Error('There was an error reassigning the pool lock'); // TODO: Create detailed error messages
  }
}