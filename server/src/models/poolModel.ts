import { PoolClient } from 'pg';
import db from '../db/db';
import { Pool, PoolLock } from '../types';

function _getLockedPoolsByContractId(contractId: number) {
  return db.query(`
    SELECT *
      FROM pool_locks
      WHERE contract_id=$1
  `, [contractId]);
};

function _getLockedAmountByPoolId(id: string | number) {
  return db.query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
      WHERE pool_id=$1
  `, [id]);
};

function _getLockedAmountByContractId(contractId: number) {
  return db.query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
      WHERE contract_id=$1
  `, [contractId]);
};

function _getLockedAmountSumByAssetId(assetId: string | number) {
  return db.query(`
    SELECT SUM(pool_locks.asset_amount)
      FROM pools, pool_locks
      WHERE pools.asset_id=$1
        AND pool_locks.pool_id=pools.pool_id
  `, [assetId]);
};

function _getTotalAmountSumByAssetId(assetId: string | number) {
  return db.query(`
    SELECT SUM(asset_amount)
      FROM pools
      WHERE asset_id=$1
  `, [assetId]);
};

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _distributeTradeFees(contractId: number, tradeFee: number, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  let feePromises = [];
  let lockPools = (await _getLockedPoolsByContractId(contractId)).rows;
  let totalAssetAmount = (await _getLockedAmountByContractId(contractId)).rows[0].sum;
  for (let pool of lockPools) {
    let fee = tradeFee * (pool.asset_amount / totalAssetAmount);
    feePromises.push(
      query(`
        UPDATE pool_locks
        SET trade_fees=trade_fees+$2
        WHERE pool_lock_id=$1
      `, [pool.pool_lock_id, fee])
    );
  }
  return Promise.all(feePromises);
};

export async function getUnlockedAmountByPoolId(id: string | number) {
  let results = await Promise.all([
    _getLockedAmountByPoolId(id),
    getPoolById(id)
  ]);
  let lockedAmount = results[0].rows[0].sum;
  let totalAmount = results[1].rows[0].asset_amount;
  return totalAmount - lockedAmount;
};

export async function getUnlockedAmountByAssetId(assetId: string | number) {
  let results = await Promise.all([
    _getLockedAmountSumByAssetId(assetId),
    _getTotalAmountSumByAssetId(assetId)
  ]);
  let lockedAmount = results[0].rows[0].sum;
  let totalAmount = results[1].rows[0].sum;
  return totalAmount - lockedAmount;
};

export function getAllPools(sort='pool_id ASC', count=10) {
  return db.query(`
    SELECT *
      FROM pools
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
};

export function getPoolById(id: string | number) {
  return db.query(`
    SELECT *
      FROM pools
      WHERE pool_id=$1
  `, [id]);
};

export function getLockedPoolsByPoolId(id: string | number) {
  return db.query(`
    SELECT *
      FROM pool_locks
      WHERE pool_id=$1
  `, [id]);
};

export function getPoolsByAssetId(assetId: string | number) {
  return db.query(`
    SELECT *
      FROM pools
      WHERE asset_id=$1
  `, [assetId]);
};

export function getPoolsByAccountId(accountId: string | number) {
  return db.query(`
    SELECT *
      FROM pools
      WHERE account_id=$1
  `, [accountId]);
};

export function getPoolLocksByAccountId(accountId: string | number) {
  return db.query(`
    SELECT pool_locks.*
      FROM pools, pool_locks
      WHERE pools.account_id=$1
        AND pool_locks.pool_id=pools.pool_id
  `, [accountId]);
};

// TODO: Validate that user has enough assets for pool
// TODO: Only allow users to create a pool for a given asset_id if it doesn't yet exist
export function createPool(pool: Pool) {
  return db.query(`
    INSERT INTO pools (
      account_id,
      asset_id,
      asset_amount
    ) VALUES (
      $1,
      $2,
      $3
    )
    RETURNING pool_id
  `,
  [
    pool.accountId,
    pool.assetId,
    pool.assetAmount
  ]);
};

// TODO: Create method to set poolLock to expired (upon expiry or exercise of the contract)

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export function _createPoolLock(poolLock: PoolLock,  client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  return query(`
    INSERT INTO pool_locks (
      pool_id,
      contract_id,
      asset_amount,
      expired
    ) VALUES ($1, $2, $3, $4)
  `,
  [
    poolLock.poolId,
    poolLock.contractId,
    poolLock.assetAmount,
    poolLock.expired
  ]);
};

export async function withdrawPoolAssets(poolId: string | number, assetAmount: number, accountId: string | number) {
  let unlockedAmount = await getUnlockedAmountByPoolId(poolId);
  if (unlockedAmount < assetAmount) throw new Error('Unlocked balance is not enough to withdraw this amount');
  return db.query(`
    UPDATE pools
    SET asset_amount=asset_amount-$2
      WHERE pool_id=$1
        AND account_id=$3
    RETURNING asset_id
  `,
  [
    poolId,
    assetAmount,
    accountId
  ]);
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

// TODO: Create delete
// Pool delete should happen on assigned contract exercise or on user withdrawal