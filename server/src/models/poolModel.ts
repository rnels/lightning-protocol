import db from '../db/db';
import { Pool, PoolLock } from '../types';
import { withdrawAccountAssetBalance, depositAccountAssetBalance } from './accountAssetModel';

function getAssetIdFromPoolId(id: string | number) {
  return db.query(`
    SELECT asset_id
      FROM pools
      WHERE pool_id=$1
  `, [id]);
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

// TODO: Create method to set poolLock to expired (upon expiry or exercise of the contract)

export async function withdrawPoolAssets(poolId: string | number, assetAmount: number, accountId: string | number) {
  let assetId = (
    await db.query(`
      UPDATE pools
      SET asset_amount=asset_amount-$2
        WHERE pool_id=$1
          AND account_id=$3
          AND locked=false
      RETURNING asset_id
    `,
    [
      poolId,
      assetAmount,
      accountId
    ])
  ).rows[0].asset_id;
  return depositAccountAssetBalance({
    accountId: accountId as number,
    assetId,
    assetAmount
  });
};

// TODO: Create more protections around possibly encountering an error
// with depositing to the pool after having the account withdrawal successfully happen
export async function depositPoolAssets(poolId: string | number, assetAmount: number, accountId: string | number) {
  let assetId = (await getAssetIdFromPoolId(poolId)).rows[0].asset_id;
  await withdrawAccountAssetBalance({
    accountId: accountId as number,
    assetId,
    assetAmount
  });
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