import { PoolClient, QueryResult } from 'pg';
import db from '../db/db';
import { Pool, PoolLock } from '../types';
import { depositPaper } from './accountModel';
import { getContractById } from './contractModel';
import { getContractTypeById } from './contractTypeModel';

// TODO: Set this up to be called by a listener periodically
// TODO: Consider setting up a new state where pools are unlocked but also can not be re-assigned to within a "cooldown" window
async function _removeExpiredPoolLocks() {
  let feePromises = [];
  let client = await db.connect();
  try {
    await client.query('BEGIN')
    // TODO: Be sure this works with the returning statement and all
    let deletePoolLocks = (await client.query(`
      DELETE FROM pool_locks
        WHERE expires_at <= NOW()
          RETURNING
            pool_id as "poolId",
            reserve_amount as "reserveAmount",
            reserve_credit as "reserveCredit"
    `)).rows;
    for (let poolLock of deletePoolLocks) {
      feePromises.push(
        client.query(`
          UPDATE pools
          SET reserve_amount=reserve_amount+$2
            WHERE pool_id=$1
        `, [poolLock.poolId, poolLock.reserveAmount - poolLock.reserveCredit])
      );
    }
    await Promise.all(feePromises);
    await client.query('COMMIT');
  } catch {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

// TODO: It's possible that if I set an incremented period from expires_at when comparing to NOW(), I can create a buffer where the lock has expired, but new contract creation still considers it locked since there's that incremental period between expiry and NOW(). For example, saying AND expires_at + (PERIOD) > NOW() means they will be left out of the "locked amount". If I allow users to claim locked_pools which have gone past their expiry but remain within this period, this also gives us a manual way to clear out pool locks, by having users "claim" the locked amounts to add them back to their pool (given the option to either return the assets to their pool or withdraw them completely), deleting the lock in the process. In order to clear out pools that have gone past the cooldown however, this still requires some kind of automated cleaning process. Since the locks are being reviewed at the time of contract creation, perhaps ones that are past expiry + interval can just be deleted. This can piggyback the creation contracts. In fact, it basically just means calling _deleteExpiredLocks right before a contract is to be created. I just need to add that period / interval buffer once I decide on it, so it works properly (and anywhere else which compares expires_at to NOW())
async function _getLockedAmountByPoolId(id: string | number, client?: PoolClient): Promise<number> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
        WHERE pool_id=$1
          AND expires_at > NOW()
  `, [id]);
  return Number(res.rows[0].sum);
}

async function _getLockedAmountSumByContractId(contractId: number, client?: PoolClient): Promise<number> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
        WHERE contract_id=$1
          AND expires_at > NOW()
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
          AND pool_locks.expires_at > NOW()
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

async function _getTradeFeesByPoolId(poolId: number, client?: PoolClient): Promise<number> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT trade_fees as "tradeFees"
      FROM pools
        WHERE pool_id=$1
  `,[poolId])
  return Number(res.rows[0].tradeFees);
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
      expires_at as "expiresAt",
      trade_fees as "tradeFees"
    FROM pool_locks
      WHERE contract_id=$1
  `, [contractId]);
  return res.rows;
}

/** Updates trade_fees on pool_locks for given contractId */
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _addToLockTradeFees(contractId: number, tradeFee: number, client: PoolClient) {
  let feePromises = [];
  let lockPools = await _getLockedPoolsByContractId(contractId, client);
  let totalAssetAmount = await _getLockedAmountSumByContractId(contractId, client);
  for (let pool of lockPools) {
    let fee = tradeFee * (Number(pool.contractAssetAmount) / totalAssetAmount);
    feePromises.push(
      client.query(`
        UPDATE pool_locks
        SET trade_fees=trade_fees+$2
          WHERE pool_lock_id=$1
      `, [pool.poolLockId, fee]),
      client.query(`
        UPDATE pools
        SET trade_fees=trade_fees+$2
          WHERE pool_id=$1
      `, [pool.poolId, fee])
    );
  }
  return Promise.all(feePromises);
}

/** Adds to reserve_amount on pool_locks for given contractId. Decreases pools.asset_amount by pool_lock.asset_amount. Used in exercising calls */
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _addToPoolLockReserve(contractId: number, strikePrice: number, client: PoolClient) {
  let reservePromises = [];
  let poolLocks = await _getLockedPoolsByContractId(contractId, client);
  for (let pool of poolLocks) {
    let reserveAmount = strikePrice * Number(pool.assetAmount);
    reservePromises.push(
      client.query(`
        UPDATE pool_locks
        SET
          reserve_amount=reserve_amount+$2,
          asset_amount=0
        WHERE pool_lock_id=$1
      `, [pool.poolLockId, reserveAmount]),
      client.query(`
        UPDATE pools
          SET asset_amount=asset_amount-$2
            WHERE pool_id=$1
      `,[pool.poolId, pool.assetAmount])
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
      asset_amount as "assetAmount",
      reserve_amount as "reserveAmount",
      trade_fees as "tradeFees"
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
        asset_amount as "assetAmount",
        reserve_amount as "reserveAmount",
        trade_fees as "tradeFees"
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

export async function getPoolByAccountAssetIds(accountId: string | number, assetId: string | number, client?: PoolClient): Promise<Pool> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  let res: QueryResult;
  try {
    res = await query(`
      SELECT
        pool_id as "poolId",
        account_id as "accountId",
        asset_id as "assetId",
        asset_amount as "assetAmount",
        reserve_amount as "reserveAmount",
        trade_fees as "tradeFees"
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
      asset_amount as "assetAmount",
      reserve_amount as "reserveAmount",
      trade_fees as "tradeFees"
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
      asset_amount as "assetAmount",
      reserve_amount as "reserveAmount",
      trade_fees as "tradeFees"
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
      asset_amount as "assetAmount",
      reserve_amount as "reserveAmount",
      trade_fees as "tradeFees"
    FROM pools
      WHERE account_id=$1
  `, [accountId]);
  return res.rows;
}

// Only gets active pool locks
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
      expires_at as "expiresAt",
      trade_fees as "tradeFees"
    FROM pool_locks
      WHERE pool_id=$1
        AND expires_at > NOW()
  `, [id]);
  return res.rows;
}

// Only gets active pool locks
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
      pool_locks.expires_at as "expiresAt",
      pool_locks.trade_fees as "tradeFees"
    FROM pools, pool_locks
      WHERE pools.account_id=$1
        AND pool_locks.pool_id=pools.pool_id
        AND pool_locks.expires_at > NOW()
  `, [accountId]);
  return res.rows;
}

export async function getPoolLockAssetsByAssetId(assetId: string | number, client?: PoolClient): Promise<number> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      SUM(pool_locks.asset_amount)
    FROM pools, pool_locks
      WHERE pools.asset_id=$1
        AND pool_locks.pool_id=pools.pool_id
        AND pool_locks.expires_at > NOW()
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
  expiresAt: Date | string,
  client: PoolClient
) {
  return client.query(`
    INSERT INTO pool_locks (
      pool_id,
      contract_id,
      asset_amount,
      contract_asset_amount,
      expires_at
    ) VALUES ($1, $2, $3, $4, $5)
  `,
  [
    poolId,
    contractId,
    assetAmount,
    assetAmount,
    expiresAt
  ]);
}

/** Removes pool_locks with the given contract_id. Forwards pool_lock.reserve_amount to respective pools */
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
// TODO: Currently not charging on the credit that's created, decide how I want to do this
// Will probably end up creating an account that holds 'emergency funds' for which to draw from for reserveCredit
export async function _deletePoolLocksByContractId(contractId: number, client: PoolClient) {
  let feePromises = [];
  let deletePoolLocks = (await client.query(`
    DELETE FROM pool_locks
      WHERE contract_id=$1
        RETURNING
          pool_id as "poolId",
          reserve_amount as "reserveAmount"
  `, [contractId])).rows;
  for (let poolLock of deletePoolLocks) {
    feePromises.push(
      client.query(`
        UPDATE pools
        SET reserve_amount=reserve_amount+$2
          WHERE pool_id=$1
      `, [poolLock.poolId, poolLock.reserveAmount])
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

export async function withdrawPoolFees(
  poolId: string | number,
  feeAmount: number,
  accountId: string | number
) {
  let tradeFees = await _getTradeFeesByPoolId(poolId as number);
  if (tradeFees < feeAmount) throw new Error('Fee balance is not enough to withdraw this amount'); // TODO: Is this needed? May be fine if it doesn't allow us to withdraw an amount that leaves it less than 0
  let client = await db.connect();
  try {
    await client.query('BEGIN');
    await Promise.all([
      // TODO: Ensure this query does not complete if it's not updating any tables (given a poolId for a different owner)
      client.query(`
        UPDATE pools
        SET trade_fees=trade_fees-$2
          WHERE pool_id=$1
            AND account_id=$3
      `, [poolId, feeAmount, accountId]),
      depositPaper(accountId, feeAmount, client)
    ])
    await client.query('COMMIT');
    client.release();
  } catch(e) {
    console.log(e); // DEBUG
    await client.query('ROLLBACK');
    client.release();
    throw new Error('There was an error withdrawing pool fees');
  }
}
