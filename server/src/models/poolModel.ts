import db from '../db/db';
import { Pool } from '../types';

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
// TODO: Validate that user owns enough tokens to make this change, can add or subtract(?) May have to do this in routes instead
export function updateTokenAmount(poolId: string | number, tokenAmount: number, accountId: string | number) {
  return db.query(`
    UPDATE pools
    SET token_amount=$2
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
