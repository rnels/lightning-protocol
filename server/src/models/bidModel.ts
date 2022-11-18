import { PoolClient, QueryResult } from 'pg';
import db from '../db/db';
import { Bid, Contract } from '../types';
import { _tradeContract } from './contractModel';
import { getActiveContractTypeById } from './contractTypeModel';

// Finds matching contracts with ask prices lower than or equal to the provided bid price
// If there are matches, executes a trade on the lowest price contract
// When this is called, there should be a bid in the table, don't call this before creating a bid
// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
async function _getMatchingAsksByBid(bid: Bid, client: PoolClient) {
  // TODO: Could probably be consolidated with getAskPricesByTypeId
  let contractType = await getActiveContractTypeById(bid.typeId, client);
  if (!contractType) throw new Error('Contract type is nonexistent or expired');
  let contracts = (await client.query(`
    SELECT
      contract_id as "contractId",
      type_id as "typeId",
      owner_id as "ownerId",
      ask_price as "askPrice",
      created_at as "createdAt",
      exercised as "exercised",
      exercised_amount as "exercisedAmount"
    FROM contracts
      WHERE type_id=$1
        AND ask_price<=$2
        AND exercised=false
    ORDER BY ask_price ASC
    FOR UPDATE
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

export async function getBidById(id: string | number, client?: PoolClient): Promise<{bidId: number, typeId: number, bidPrice: string}> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  let res: QueryResult;
  try {
    res = await query(`
      SELECT
        bid_id as "bidId",
        type_id as "typeId",
        bid_price as "bidPrice"
      FROM bids
        WHERE bid_id=$1
    `, [id]);
  } catch {
    throw new Error('There was an error retrieving the bid');
  }
  if (res.rows.length === 0) throw new Error(`Bid with bidId ${id} does not exist`);
  return res.rows[0];
}

/** Get all bids for a given contract type, used by the client */
export async function getBidsByContractTypeId(typeId: string | number, client?: PoolClient): Promise<Bid[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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
  accountId: string | number,
  client?: PoolClient
): Promise<Bid[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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
export async function getBidsByAccountId(accountId: string | number, client?: PoolClient): Promise<Bid[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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
    client.release();
  } catch (e) {
    await client.query('ROLLBACK');
    client.release();
    console.log(e); // DEBUG
    throw new Error('There was an error creating the bid'); // TODO: Create detailed error messages
  }
}

export async function updateBidPrice(bidId: number | string, bidPrice: number, accountId: number | string) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
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
    ])).rows[0] as Bid;
    let contracts = await _getMatchingAsksByBid(bid, client);
    if (contracts.length > 0) await _tradeContract(contracts[0], bid, client);
    await client.query('COMMIT');
    client.release();
  } catch (e) {
    await client.query('ROLLBACK');
    client.release();
    console.log(e); // DEBUG
    throw new Error('There was an error updating the bid'); // TODO: Create detailed error messages
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
