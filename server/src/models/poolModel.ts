import db from '../db/db';
import { Pool } from '../types';
import { withdrawAccountTokenBalance, depositAccountTokenBalance } from './accountTokenModel';

function getTokenIdFromPoolId(id: string | number) {
  return db.query(`
    SELECT token_id
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

export function getPoolsByTokenId(tokenId: string | number) {
  return db.query(`
    SELECT *
      FROM pools
      WHERE token_id=$1
  `, [tokenId]);
};

export function getPoolsByAccountId(accountId: string | number) {
  return db.query(`
    SELECT *
      FROM pools
      WHERE account_id=$1
  `, [accountId]);
};

// TODO: Validate that user has enough tokens for pool
// TODO: Only allow users to create a pool for a given token_id if it doesn't yet exist
export function createPool(pool: Pool) {
  return db.query(`
    INSERT INTO pools (
      account_id,
      token_id,
      token_amount,
      locked
    ) VALUES (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING pool_id
  `,
  [
    pool.accountId,
    pool.tokenId,
    pool.tokenAmount,
    pool.locked
  ]);
};

// TODO(?): Create additional update(s)

// TODO: Have this called when a contract sources from a pool to lock the pool, then call it when the contract is expired to unlock it
export function updateLocked(poolId: string | number, locked: boolean, accountId: string | number) {
  return db.query(`
    UPDATE pools
    SET locked=$2
      WHERE pool_id=$1
        AND account_id=$3
  `,
  [
    poolId,
    locked,
    accountId
  ]);
};

export async function withdrawPoolTokens(poolId: string | number, tokenAmount: number, accountId: string | number) {
  let tokenId = (
    await db.query(`
      UPDATE pools
      SET token_amount=token_amount-$2
        WHERE pool_id=$1
          AND account_id=$3
          AND locked=false
      RETURNING token_id
    `,
    [
      poolId,
      tokenAmount,
      accountId
    ])
  ).rows[0].token_id;
  return depositAccountTokenBalance({
    accountId: accountId as number,
    tokenId,
    tokenAmount
  });
};

// TODO: Create more protections around possibly encountering an error
// with depositing to the pool after having the account withdrawal successfully happen
export async function depositPoolTokens(poolId: string | number, tokenAmount: number, accountId: string | number) {
  let tokenId = (await getTokenIdFromPoolId(poolId)).rows[0].token_id;
  await withdrawAccountTokenBalance({
    accountId: accountId as number,
    tokenId,
    tokenAmount
  });
  return db.query(`
    UPDATE pools
    SET token_amount=token_amount+$2
      WHERE pool_id=$1
        AND account_id=$3
  `,
  [
    poolId,
    tokenAmount,
    accountId
  ]);
};

// TODO: Create delete
// Pool delete should happen on assigned contract exercise or on user withdrawal