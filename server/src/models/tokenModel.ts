import db from '../db/db';
import { Token } from '../types';

export function getAllTokens(sort='token_id ASC', count=10) {
  return db.query(`
    SELECT *
      FROM tokens
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
};

export function getTokenById(id: string | number) {
  return db.query(`
    SELECT *
      FROM tokens
      WHERE token_id=$1
  `, [id]);
};

export function createToken(token: Token) {
  return db.query(`
    INSERT INTO tokens (
      token_id
    ) VALUES (
      $1
    )
    RETURNING token_id
  `,
  [token.tokenId]);
};
