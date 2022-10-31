import { PoolClient } from 'pg';
import db from '../db/db';
import { Bid, Contract } from '../types';
import { _tradeContract } from './contractModel';

// Finds matching contracts with ask prices lower than or equal to the provided bid price
// If there are matches, executes a trade on the lowest price contract
// When this is called, there should be a bid in the table, don't call this before creating a bid
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
async function _getMatchingAsksByBid(bid: Bid, client: PoolClient) {
  // TODO: Could probably be consolidated with getAskPricesByTypeId
  let contracts = (await client.query(`
    SELECT
      contracts.contract_id as "contractId",
      contracts.type_id as "typeId",
      contracts.owner_id as "ownerId",
      contracts.ask_price as "askPrice",
      contracts.created_at as "createdAt",
      contracts.exercised as "exercised",
      contracts.exercised_amount as "exercisedAmount"
    FROM contracts, contract_types
      WHERE contracts.type_id=$1
        AND contracts.ask_price<=$2
        AND contracts.exercised=false
        AND contract_types.expires_at > NOW()
        AND contracts.type_id=contract_types.contract_type_id
    ORDER BY contracts.ask_price ASC
  `, [bid.typeId, bid.bidPrice])).rows as Contract[];
  return contracts;
}

export function _removeBid(bidId: number | string, client: PoolClient) {
  return client.query(`
    DELETE FROM bids
      WHERE bid_id=$1
  `,
  [
    bidId
  ]);
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

/** Get all bids for a given contract type, used by the client */
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

/** Get bids for a given contract type and account ID, used for an account to see their existing bids on a contract type */
export async function getBidsByContractTypeAndAccountId(
  typeId: string | number,
  accountId: string | number
): Promise<Bid[]> {
  const res = await db.query(`
    SELECT
      bid_id as "bidId",
      type_id as "typeId",
      bid_price as "bidPrice"
    FROM bids
      WHERE type_id=$1
        AND account_id=$2
  `, [typeId, accountId]);
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

// Create bid object from result of query to pass to _getMatchingAsksByBid
export async function createBid(typeId: number, accountId: number, bidPrice: number) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE contracts IN EXCLUSIVE MODE'); // TODO: Bandaid solution for restricting concurrent access, but research better ways
    const bid = (await client.query(`
      INSERT INTO bids (
        type_id,
        account_id,
        bid_price
      ) VALUES (
        $1,
        $2,
        $3
      )
      RETURNING
        bid_id as "bidId",
        type_id as "typeId",
        account_id as "accountId",
        bid_price as "bidPrice",
        created_at as "createdAt"
    `,
    [
      typeId,
      accountId,
      bidPrice
    ])).rows[0] as Bid;
    let contracts = await _getMatchingAsksByBid(bid, client);
    if (contracts.length > 0) await _tradeContract(contracts[0], bid, client);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.log(e); // DEBUG
  } finally {
    client.release();
  }
}

export async function updateBidPrice(bidId: number | string, bidPrice: number, accountId: number | string) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE contracts IN EXCLUSIVE MODE'); // TODO: Bandaid solution for restricting concurrent access, but research better ways
    // TODO: Ensure this works
    await client.query('LOCK TABLE bids IN ROW EXCLUSIVE MODE');
    const bid = (await client.query(`
      UPDATE bids SET bid_price=$2
        WHERE bid_id=$1
          AND account_id=$3
      RETURNING
        bid_id as "bidId",
        type_id as "typeId",
        account_id as "accountId",
        bid_price as "bidPrice",
        created_at as "createdAt"
    `,
    [
      bidId,
      bidPrice,
      accountId
    ])).rows[0];
    let contracts = await _getMatchingAsksByBid(bid, client);
    if (contracts.length > 0) await _tradeContract(contracts[0], bid, client);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.log(e); // DEBUG
  } finally {
    client.release();
  }
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
