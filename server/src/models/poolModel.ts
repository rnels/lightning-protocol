import { PoolClient, QueryResult } from 'pg';
import db from '../db/db';
import { Pool, PoolLock } from '../types';
import { depositPaper } from './accountModel';

// TODO: Create function to remove pool_locks on expired contracts,
// should be set up to be called by a listener

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
}

async function _getLockedAmountByPoolId(id: string | number): Promise<number> {
  const res = await db.query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
        WHERE pool_id=$1
          AND expires_at > NOW()
  `, [id]);
  return res.rows[0].sum;
}

async function _getLockedAmountSumByContractId(contractId: number): Promise<number> {
  const res = await db.query(`
    SELECT SUM(asset_amount)
      FROM pool_locks
        WHERE contract_id=$1
          AND expires_at > NOW()
  `, [contractId]);
  return res.rows[0].sum;
}

async function _getLockedAmountSumByAssetId(assetId: string | number): Promise<number> {
  const res = await db.query(`
    SELECT SUM(pool_locks.asset_amount)
      FROM pools, pool_locks
        WHERE pools.asset_id=$1
          AND pool_locks.pool_id=pools.pool_id
          AND pool_locks.expires_at > NOW()
  `, [assetId]);
  return res.rows[0].sum;
}

async function _getTotalAmountSumByAssetId(assetId: string | number): Promise<number> {
  const res = await db.query(`
    SELECT SUM(asset_amount)
      FROM pools
        WHERE asset_id=$1
  `, [assetId]);
  return res.rows[0].sum;
}

async function _doesPoolExist(accountId: number, assetId: number): Promise<boolean> {
  const res = await db.query(`
    SELECT EXISTS(
      SELECT pool_id
        FROM pools
        WHERE account_id=$1
          AND asset_id=$2
    )
  `, [accountId, assetId]);
  return res.rows[0].exists;
}

async function _getTradeFeesByPoolId(poolId: number): Promise<number> {
  const res = await db.query(`
    SELECT trade_fees as "tradeFees"
      FROM pools
        WHERE pool_id=$1
  `,[poolId])
  return res.rows[0].tradeFees;
}

/** Updates trade_fees on pool_locks for given contractId */
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _addToLockTradeFees(contractId: number, tradeFee: number, client: PoolClient) {
  let feePromises = [];
  let lockPools = await _getLockedPoolsByContractId(contractId);
  let totalAssetAmount = await _getLockedAmountSumByContractId(contractId);
  for (let pool of lockPools) {
    let fee = tradeFee * (pool.assetAmount / totalAssetAmount);
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

/** Decreases pools.asset_amount by pool_lock.asset_amount and sells the pool_locks for a given contractId */
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _sellPoolLockAssets(contractId: number, client: PoolClient) {
  let poolAssetPromises = [];
  let lockPools = await _getLockedPoolsByContractId(contractId);
  for (let pool of lockPools) {
    // Opting to write this query here instead of using withdrawPoolAssets because I see them being used in different contexts,
    // withdrawPoolAssets being used by a route and updated at some point to actually provide pooled assets to the user's wallet balance
    poolAssetPromises.push(
      client.query(`
        UPDATE pools
          SET asset_amount=asset_amount-$2
            WHERE pool_id=$1
      `,[pool.poolId, pool.assetAmount])
    );
  }
  await Promise.all(poolAssetPromises); // NOTE: Ensure this is resolved before _removePoolLocksByContractId is invoked
  return _removePoolLocksByContractId(contractId, client);
}

export async function getUnlockedAmountByPoolId(id: string | number): Promise<number> {
  let results = await Promise.all([
    _getLockedAmountByPoolId(id),
    getPoolById(id)
  ]);
  let lockedAmount = results[0];
  let totalAmount = results[1].assetAmount;
  return totalAmount - lockedAmount;
}

export async function getUnlockedAmountByAssetId(assetId: string | number): Promise<number> {
  let results = await Promise.all([
    _getLockedAmountSumByAssetId(assetId),
    _getTotalAmountSumByAssetId(assetId)
  ]);
  let lockedAmount = results[0];
  let totalAmount = results[1];
  return totalAmount - lockedAmount;
}

export async function getAllPools(sort='pool_id ASC'): Promise<Pool[]> {
  const res = await db.query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount",
      trade_fees as "tradeFees"
    FROM pools
    ORDER BY $1
  `, [sort]);
  return res.rows;
}

export async function getPoolById(id: string | number): Promise<Pool> {
  const res = await db.query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount",
      trade_fees as "tradeFees"
    FROM pools
    WHERE pool_id=$1
  `, [id]);
  return res.rows[0];
}

export async function getPoolsByAssetId(assetId: string | number): Promise<Pool[]> {
  const res = await db.query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount",
      trade_fees as "tradeFees"
    FROM pools
      WHERE asset_id=$1
  `, [assetId]);
  return res.rows;
}

export async function getPoolAssetsByAssetId(assetId: string | number): Promise<number> {
  const res = await db.query(`
    SELECT
      SUM(asset_amount)
    FROM pools
      WHERE asset_id=$1
  `, [assetId]);
  return res.rows[0].sum;
}

export async function getPoolsByAccountId(accountId: string | number): Promise<Pool[]> {
  const res = await db.query(`
    SELECT
      pool_id as "poolId",
      account_id as "accountId",
      asset_id as "assetId",
      asset_amount as "assetAmount",
      trade_fees as "tradeFees"
    FROM pools
      WHERE account_id=$1
  `, [accountId]);
  return res.rows;
}

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
}

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
        AND pool_locks.expires_at > NOW()
  `, [accountId]);
  return res.rows;
}

export async function getPoolLockAssetsByAssetId(assetId: string | number): Promise<number> {
  const res = await db.query(`
    SELECT
      SUM(pool_locks.asset_amount)
    FROM pools, pool_locks
      WHERE pools.asset_id=$1
        AND pool_locks.pool_id=pools.pool_id
        AND pool_locks.expires_at > NOW()
  `, [assetId]);
  return res.rows[0].sum;
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
  expiresAt: string,
  client: PoolClient
) {
  return client.query(`
    INSERT INTO pool_locks (
      pool_id,
      contract_id,
      asset_amount,
      expires_at
    ) VALUES ($1, $2, $3, $4)
  `,
  [
    poolId,
    contractId,
    assetAmount,
    expiresAt
  ]);
}

/** Removes pool_locks with the given contract_id */
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export function _removePoolLocksByContractId(contractId: number, client: PoolClient) {
  return client.query(`
    DELETE FROM pool_locks
      WHERE contract_id=$1
  `, [contractId]);
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

// TODO: Create delete
// Pool delete should happen on assigned contract exercise or on user withdrawal
