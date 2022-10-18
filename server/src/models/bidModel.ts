import db from '../db/db';
import { Bid } from '../types';
import { getMatchingAsksByBid } from './contractModel';

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

export async function createBid(bid: Bid) {
  try { await getMatchingAsksByBid(bid); } catch { }
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

export async function updateBidPrice(bidId: number | string, bidPrice: number, accountId: number | string) {
  let typeId = (await
    db.query(`
      UPDATE bids SET bid_price=$2
      WHERE bid_id=$1
        AND account_id=$3
      RETURNING type_id
    `,
    [
      bidId,
      bidPrice,
      accountId
    ])
  ).rows[0].type_id;
  try {
    let bid: Bid = {
      typeId,
      accountId: accountId as number,
      bidPrice
    }
    await getMatchingAsksByBid(bid);
  } catch { }
}

export function removeBid(bidId: number | string, accountId: number | string) {
  return db.query(`
    DELETE FROM bids
    WHERE bid_id=$1
      AND account_id=$2
  `,
  [
    bidId,
    accountId
  ]);
}

// TODO: Create model for accepting a bid price against a contract ask price, which turns into a trade

// TODO: Create model function for cancelling a bid (either an update, would require status field, or a full delete)
