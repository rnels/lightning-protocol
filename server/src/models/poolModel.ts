import { PoolClient } from 'pg';
import db from '../db/db';
import { Pool, PoolLock } from '../types';

async function _getLockedPoolsByContractId(contractId: number): Promise<PoolLock[]> {
  const res = await db.query(`
    SELECT
      pool_lock_id as "poolLockId",
      pool_id as "poolId",
      contract_id as "contractId",
      asset_amount as "assetAmount",
      expires_at as "expiresAt",
      trade_fees as "tradeFees"
    FROM pool_locks
      WHERE contract_id=$1
  `, [contractId]);
  return res.rows;
};

async function _getLockedAmountByPoolId(id: string | number): Promise<number> {
  const res = await db.query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
        WHERE pool_id=$1
          AND expires_at > NOW()
  `, [id]);
  return res.rows[0].sum;
};

async function _getLockedAmountSumByContractId(contractId: number): Promise<number> {
  const res = await db.query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
        WHERE contract_id=$1
          AND expires_at > NOW()
  `, [contractId]);
  return res.rows[0].sum;
};

async function _getLockedAmountSumByAssetId(assetId: string | number): Promise<number> {
  const res = await db.query(`
    SELECT SUM(pool_locks.asset_amount)
      FROM pools, pool_locks
        WHERE pools.asset_id=$1
          AND pool_locks.pool_id=pools.pool_id
          AND pool_locks.expires_at > NOW()
  `, [assetId]);
  return res.rows[0].sum;
};

async function _getTotalAmountSumByAssetId(assetId: string | number): Promise<number> {
  const res = await db.query(`
    SELECT SUM(asset_amount)
      FROM pools
        WHERE asset_id=$1
  `, [assetId]);
  return res.rows[0].sum;
};

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _distributeTradeFees(contractId: number, tradeFee: number, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  let feePromises = [];
  let lockPools = await _getLockedPoolsByContractId(contractId);
  let totalAssetAmount = await _getLockedAmountSumByContractId(contractId);
  console.log('totalAssetAmount', totalAssetAmount);
  for (let pool of lockPools) {
    console.log('pool.assetAmount', pool.assetAmount);
    let fee = tradeFee * (pool.assetAmount / totalAssetAmount);
    console.log('fee', fee);
    console.log('tradeFee', tradeFee);
    feePromises.push(
      query(`
        UPDATE pool_locks
        SET trade_fees=trade_fees+$2
          WHERE pool_lock_id=$1
      `, [pool.poolLockId, fee])
    );
  }
  return Promise.all(feePromises);
};

export async function getUnlockedAmountByPoolId(id: string | number): Promise<number> {
  let results = await Promise.all([
    _getLockedAmountByPoolId(id),
    getPoolById(id)
  ]);
  let lockedAmount = results[0];
  let totalAmount = results[1].assetAmount;
  return totalAmount - lockedAmount;
};

export async function getUnlockedAmountByAssetId(assetId: string | number): Promise<number> {
  let results = await Promise.all([
    _getLockedAmountSumByAssetId(assetId),
    _getTotalAmountSumByAssetId(assetId)
  ]);
  let lockedAmount = results[0];
  let totalAmount = results[1];
  return totalAmount - lockedAmount;
};

export async function getAllPools(sort='pool_id ASC'): Promise<Pool[]> {
  const res = await db.query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount"
    FROM pools
    ORDER BY $1
  `, [sort]);
  return res.rows;
};

export async function getPoolById(id: string | number): Promise<Pool> {
  const res = await db.query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount"
    FROM pools
    WHERE pool_id=$1
  `, [id]);
  return res.rows[0];
};

export async function getPoolsByAssetId(assetId: string | number): Promise<Pool[]> {
  const res = await db.query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount"
    FROM pools
      WHERE asset_id=$1
  `, [assetId]);
  return res.rows;
};

export async function getPoolsByAccountId(accountId: string | number): Promise<Pool[]> {
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
};

// Only gets active pool locks
export async function getPoolLocksByPoolId(id: string | number): Promise<PoolLock[]> {
  const res = await db.query(`
    SELECT
      pool_lock_id as "poolLockId",
      pool_id as "poolId",
      contract_id as "contractId",
      asset_amount as "assetAmount",
      expires_at as "expiresAt",
      trade_fees as "tradeFees"
    FROM pool_locks
      WHERE pool_id=$1
        AND expires_at > NOW()
  `, [id]);
  return res.rows;
};

// Only gets active pool locks
export async function getPoolLocksByAccountId(accountId: string | number): Promise<PoolLock[]> {
  const res = await db.query(`
    SELECT
      pool_locks.pool_lock_id as "poolLockId",
      pool_locks.pool_id as "poolId",
      pool_locks.contract_id as "contractId",
      pool_locks.asset_amount as "assetAmount",
      pool_locks.expires_at as "expiresAt",
      pool_locks.trade_fees as "tradeFees"
    FROM pools, pool_locks
      WHERE pools.account_id=$1
        AND pool_locks.pool_id=pools.pool_id
        AND expires_at > NOW()
  `, [accountId]);
  return res.rows;
};

// TODO: Validate that user has enough assets for pool
// TODO: Only allow users to create a pool for a given asset_id if it doesn't yet exist
export async function createPool(pool: Pool): Promise<{poolId: number}> {
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
    pool.accountId,
    pool.assetId,
    pool.assetAmount
  ]);
  return res.rows[0];
};

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export function _createPoolLock(poolLock: PoolLock,  client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  return query(`
    INSERT INTO pool_locks (
      pool_id,
      contract_id,
      asset_amount,
      expires_at
    ) VALUES ($1, $2, $3, $4)
  `,
  [
    poolLock.poolId,
    poolLock.contractId,
    poolLock.assetAmount,
    poolLock.expiresAt
  ]);
};

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export function _removePoolLocksByContractId(contractId: number, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  return query(`
    DELETE FROM pool_locks
    WHERE contract_id=$1
  `, [contractId]);
};

// TODO: Use this function in exercising a contract
// Add a client?: PoolClient and the works
export async function withdrawPoolAssets(poolId: string | number, assetAmount: number, accountId: string | number): Promise<{assetId: number}> {
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
};

// NOTE: As of now there's no limit on depositing assets, you can just define a number of assets to deposit
// This is for the paper model, for the bc model it will be wallet based
export function depositPoolAssets(poolId: string | number, assetAmount: number, accountId: string | number) {
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
};


export async function _sellPoolAssets(poolId: string | number, assetAmount: number) {
  // TODO: Implement :^)
};

// TODO: Create delete
// Pool delete should happen on assigned contract exercise or on user withdrawal
