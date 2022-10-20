import { PoolClient } from 'pg';
import db from '../db/db';
import { Bid, Contract } from '../types';
import { _tradeContract } from './contractModel';

// Finds matching contracts with ask prices lower than or equal to the provided bid price
// If there are matches, executes a trade on the lowest price contract
// When this is called, there should be a bid in the table, don't call this before creating a bid
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
async function _getMatchingAsksByBid(bid: Bid) {
  let contracts = (await db.query(`
    SELECT
        contracts.contract_id as "contractId",
        contracts.type_id as "typeId",
        contracts.owner_id as "ownerId",
        contracts.ask_price as "askPrice",
        contracts.created_at as "createdAt",
        contracts.exercised as "exercised"
    FROM contracts, contract_types
    WHERE contracts.type_id=$1
      AND contracts.ask_price<=$2
      AND contracts.exercised=false
      AND contract_types.expires_at > NOW()
      AND contracts.type_id=contract_types.contract_type_id
    ORDER BY contracts.ask_price ASC
  `, [bid.typeId, bid.bidPrice])).rows as Contract[];
  console.log(contracts);
  if (contracts.length === 0) return;
  let contract = contracts[0];
  _tradeContract(contract, bid);
}

export async function getAllBids(sort='bid_id ASC'): Promise<Bid[]> {
  const res = await db.query(`
    SELECT
      bid_id as "bidId",
      type_id as "typeId",
      bid_price as "bidPrice"
    FROM bids
    ORDER BY $1
  `, [sort]);
  return res.rows;
}

export async function getBidById(id: string | number): Promise<Bid> {
  const res = await db.query(`
    SELECT
      bid_id as "bidId",
      type_id as "typeId",
      bid_price as "bidPrice"
    FROM bids
      WHERE bid_id=$1
  `, [id]);
  return res.rows[0];
}

export async function getBidsByContractTypeId(typeId: string | number): Promise<Bid[]> {
  const res = await db.query(`
    SELECT
      bid_id as "bidId",
      type_id as "typeId",
      bid_price as "bidPrice"
    FROM bids
      WHERE type_id=$1
  `, [typeId]);
  return res.rows;
}

// Only intended to take an accountId of the authenticated user (or used by internal functions)
export async function getBidsByAccountId(accountId: string | number): Promise<Bid[]> {
  const res = await db.query(`
    SELECT
      bid_id as "bidId",
      type_id as "typeId",
      bid_price as "bidPrice"
    FROM bids
      WHERE account_id=$1
  `, [accountId]);
  return res.rows;
}

// TODO: Change the arguments to accept typeId, accountId, bidPrice, rather than Bid object
// Create bid object from result of query to pass to _getMatchingAsksByBid
export async function createBid(bid: Bid): Promise<{bidId: number}> {
  const res = await db.query(`
    INSERT INTO bids (
      type_id,
      account_id,
      bid_price
    ) VALUES (
      $1,
      $2,
      $3
    )
    RETURNING bid_id as "bidId"
  `,
  [
    bid.typeId,
    bid.accountId,
    bid.bidPrice
  ]);
  bid.bidId = res.rows[0].bidId;
  _getMatchingAsksByBid(bid);
  return res.rows[0];
}

export async function updateBidPrice(bidId: number | string, bidPrice: number, accountId: number | string): Promise<{typeId: number}> {
  const res = await db.query(`
    UPDATE bids SET bid_price=$2
    WHERE bid_id=$1
      AND account_id=$3
    RETURNING type_id as "typeId"
  `,
  [
    bidId,
    bidPrice,
    accountId
  ]);
  let typeId = res.rows[0].typeId;
  let bid: Bid = {
      typeId,
      accountId: accountId as number,
      bidPrice
  }
  _getMatchingAsksByBid(bid);
  return res.rows[0].typeId;
}

export function removeBid(bidId: number | string, accountId: number | string, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  return query(`
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
