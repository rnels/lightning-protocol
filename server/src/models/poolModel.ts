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

export function getPoolsByAccountId(accountId: string | number) {
  return db.query(`
    SELECT *
      FROM pools
      WHERE account_id=$1
  `, [accountId]);
};

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
