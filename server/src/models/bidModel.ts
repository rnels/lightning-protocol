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

export function getBidsByContractTypeId(typeId: string | number) {
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

export function updateBidPrice(bidId: number | string, bidPrice: number, accountId: number | string) {
  return db.query(`
    UPDATE bids SET bid_price=$2
    WHERE bid_id=$1
      AND account_id=$3
  `,
  [
    bidId,
    bidPrice,
    accountId
  ]);
}

// TODO: Create model for accepting a bid price against a contract ask price, which turns into a trade

// TODO: Create model function for cancelling a bid (either an update, would require status field, or a full delete)
