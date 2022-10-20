import { PoolClient } from 'pg';
import db from '../db/db';
import { Trade } from '../types';

// I'm not sure where you would ever use this
export async function getAllTrades(sort='trade_id ASC', count=100): Promise<Trade[]> {
  const res = await db.query(`
    SELECT
      trade_id as "tradeId",
      contract_id as "contractId",
      buyer_id as "buyerId",
      seller_id as "sellerId",
      sale_price as "salePrice",
      trade_fee as "tradeFee",
      created_at as "createdAt"
    FROM trades
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
  return res.rows;
};

export async function getTradeById(id: string | number): Promise<Trade> {
  const res = await db.query(`
    SELECT
      trade_id as "tradeId",
      contract_id as "contractId",
      buyer_id as "buyerId",
      seller_id as "sellerId",
      sale_price as "salePrice",
      trade_fee as "tradeFee",
      created_at as "createdAt"
    FROM trades
      WHERE trade_id=$1
  `, [id]);
  return res.rows[0];
};

// Should definitely be internal facing
export async function getTradesByContractId(contractId: string | number): Promise<Trade[]> {
  const res = await db.query(`
    SELECT
      trade_id as "tradeId",
      contract_id as "contractId",
      buyer_id as "buyerId",
      seller_id as "sellerId",
      sale_price as "salePrice",
      trade_fee as "tradeFee",
      created_at as "createdAt"
    FROM trades
      WHERE contract_id=$1
  `, [contractId]);
  return res.rows;
};

// Returns both trades for an account as a buyer and a seller
// TODO: Shouldn't be able to see the account traded with, currently you can
// If I wanted to do a system for the client where you can see whether it's a buy or a sell,
// I need to export something in this query, possibly using a subquery to tell
// whether they were the buyer or seller by comparing account_id to accountId
// Such as using an 'IN' expression: https://www.postgresql.org/docs/current/functions-subquery.html
export async function getTradesByAccountId(accountId: string | number): Promise<Trade[]> {
  const res = await db.query(`
    SELECT
      trade_id as "tradeId",
      contract_id as "contractId",
      buyer_id as "buyerId",
      seller_id as "sellerId",
      sale_price as "salePrice",
      trade_fee as "tradeFee",
      created_at as "createdAt"
    FROM trades
      WHERE buyer_id=$1
        OR seller_id=$1
  `, [accountId]);
  return res.rows;
};

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _createTrade(trade: Trade, client?: PoolClient): Promise<{tradeId: number}> {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  const res = await query(`
    INSERT INTO trades (
      contract_id,
      buyer_id,
      seller_id,
      sale_price,
      trade_fee
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING trade_id as "tradeId"
  `,
  [
    trade.contractId,
    trade.buyerId,
    trade.sellerId,
    trade.salePrice,
    trade.tradeFee
  ]);
  return res.rows[0];
};
