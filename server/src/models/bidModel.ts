import db from '../db/db';
import { Bid } from '../types';

export function getAllBids(sort='bid_id ASC', count=10) {
  return db.query(`
    SELECT *
      FROM bids
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
};

export function getBidById(id: string | number) {
  return db.query(`
    SELECT *
      FROM bids
      WHERE bid_id=$1
  `, [id]);
};

export function getBidsByTypeId(typeId: string | number) {
  return db.query(`
    SELECT *
      FROM bids
      WHERE type_id=$1
  `, [typeId]);
};

export function getBidsByAccountId(accountId: string | number) {
  return db.query(`
    SELECT *
      FROM bids
      WHERE account_id=$1
  `, [accountId]);
};

export function createBid(bid: Bid) {
  return db.query(`
    INSERT INTO bids (
      type_id,
      account_id,
      bid_price
    ) VALUES (
      $1,
      $2,
      $3
    )
    RETURNING bid_id
  `,
  [
    bid.typeId,
    bid.accountId,
    bid.bidPrice
  ]);
};
