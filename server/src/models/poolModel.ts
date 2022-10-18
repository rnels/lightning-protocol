import db from '../db/db';
import { Pool, PoolLock } from '../types';

function getAssetIdFromPoolId(id: string | number) {
  return db.query(`
    SELECT asset_id
      FROM pools
      WHERE pool_id=$1
  `, [id]);
};

function getLockedAmountFromPoolId(id: string | number) {
  return db.query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
      WHERE pool_id=$1
  `, [id]);
};

// TODO: BIG TEST THIS ONE
function getUnlockedAmountFromPoolId(id: string | number) {
  return Promise.all([
    getLockedAmountFromPoolId(id),
    db.query(`
      SELECT SUM(asset_amount)
        FROM pools
        WHERE pool_id=$1
    `, [id])
  ])
    .then((results) => {
      let lockedAmount = results[0].rows[0].sum; // TODO: Test this
      let totalAmount = results[1].rows[0].sum; // TODO: Test this
      return totalAmount - lockedAmount;
    });
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

export function getPoolAssetAmountByAssetId(assetId: string | number) {
  return db.query(`
    SELECT asset_amount
      FROM pools
      WHERE asset_id=$1
  `, [assetId]);
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

// TODO(?): Create additional update(s)
// TODO: Create method to set poolLock to expired (upon expiry or exercise of the contract)
export function createPoolLock(poolLock: PoolLock) {
  return db.query(`
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

// TODO: Add check for poolLocks, subtract locked amount for asset_amount to get max amount to withdraw
// TODO: Create helper for getting locked amount
export async function withdrawPoolAssets(poolId: string | number, assetAmount: number, accountId: string | number) {
  let unlockedAmount = await getUnlockedAmountFromPoolId(poolId);
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