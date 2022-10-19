import db from '../db/db';
import { Bid, Contract } from '../types';
import { tradeContract } from './contractModel';

// Finds matching contracts with ask prices lower than or equal to the provided bid price
// If there are matches, executes a trade on the lowest price contract
// When this is called, there should be a bid in the table, don't call this before creating a bid
async function getMatchingAsksByBid(bid: Bid) {
  let contracts = (await
    db.query(`
      SELECT contracts.*
        FROM contracts, contract_types
        WHERE contracts.type_id=$1
          AND contracts.ask_price<=$2
          AND contracts.exercised=false
          AND contract_types.expires_at < NOW()
          AND contracts.type_id=contract_types.contract_type_id
        ORDER BY contracts.ask_price ASC
    `, [bid.typeId, bid.bidPrice])
  ).rows;
  if (contracts.length === 0) return;
  let contract: Contract = {
    contractId: contracts[0].contract_id,
    typeId: contracts[0].type_id,
    ownerId: contracts[0].owner_id,
    askPrice: contracts[0].ask_price,
    createdAt: contracts[0].created_at,
    exercised: contracts[0].exercised
  }
  return tradeContract(contract, bid);
}

export function getAllBids(sort='bid_id ASC', count=10) {
  return db.query(`
    SELECT *
      FROM bids
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
}

export function getBidById(id: string | number) {
  return db.query(`
    SELECT *
      FROM bids
      WHERE bid_id=$1
  `, [id]);
}

export function getBidsByContractTypeId(typeId: string | number) {
  return db.query(`
    SELECT *
      FROM bids
      WHERE type_id=$1
  `, [typeId]);
}

export function getBidsByAccountId(accountId: string | number) {
  return db.query(`
    SELECT *
      FROM bids
      WHERE account_id=$1
  `, [accountId]);
}

export async function createBid(bid: Bid) {
  let result = await db.query(`
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
  bid.bidId = result.rows[0].bid_id;
  getMatchingAsksByBid(bid);
  return result;
}

export async function updateBidPrice(bidId: number | string, bidPrice: number, accountId: number | string) {
  let result = await db.query(`
    UPDATE bids SET bid_price=$2
    WHERE bid_id=$1
      AND account_id=$3
    RETURNING type_id
  `,
  [
    bidId,
    bidPrice,
    accountId
  ]);
  let typeId = result.rows[0].type_id;
  let bid: Bid = {
      typeId,
      accountId: accountId as number,
      bidPrice
  }
  getMatchingAsksByBid(bid);
  return result;
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
