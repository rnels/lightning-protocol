import { PoolClient } from 'pg';
import db from '../db/db';
import { Trade } from '../types';

// I'm not sure where you would ever use this
export async function getAllTrades(sort='trade_id ASC', count=100): Promise<Trade[]> {
  const res = await db.query(`
    SELECT
      trade_id as "tradeId",
      contract_id as "contractId",
      type_id as "typeId",
      buyer_id as "buyerId",
      seller_id as "sellerId",
      sale_price as "salePrice",
      sale_cost as "saleCost",
      trade_fee as "tradeFee",
      created_at as "createdAt"
    FROM trades
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
  return res.rows;
}

export async function getTradeById(id: string | number): Promise<Trade> {
  const res = await db.query(`
    SELECT
      trade_id as "tradeId",
      contract_id as "contractId",
      type_id as "typeId",
      buyer_id as "buyerId",
      seller_id as "sellerId",
      sale_price as "salePrice",
      sale_cost as "saleCost",
      trade_fee as "tradeFee",
      created_at as "createdAt"
    FROM trades
      WHERE trade_id=$1
  `, [id]);
  return res.rows[0];
}

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
      type_id as "typeId",
      buyer_id as "buyerId",
      seller_id as "sellerId",
      sale_price as "salePrice",
      sale_cost as "saleCost",
      trade_fee as "tradeFee",
      created_at as "createdAt"
    FROM trades
      WHERE buyer_id=$1
        OR seller_id=$1
  `, [accountId]);
  return res.rows;
}

export async function getTradesByContractId(contractId: string | number): Promise<Trade[]> {
  const res = await db.query(`
    SELECT
      trade_id as "tradeId",
      contract_id as "contractId",
      type_id as "typeId",
      sale_price as "salePrice",
      sale_cost as "saleCost",
      trade_fee as "tradeFee",
      created_at as "createdAt"
    FROM trades
      WHERE contract_id=$1
  `, [contractId]);
  return res.rows;
}

/** Represents "Last" */
export async function getLastTradeByTypeId(typeId: string | number): Promise<Trade> {
  const res = await db.query(`
    SELECT
      trade_id as "tradeId",
      contract_id as "contractId",
      type_id as "typeId",
      buyer_id as "buyerId",
      seller_id as "sellerId",
      sale_price as "salePrice",
      sale_cost as "saleCost",
      trade_fee as "tradeFee",
      created_at as "createdAt"
    FROM trades
      WHERE type_id=$1
    ORDER BY created_at DESC
  `, [typeId]);
  return res.rows[0];
}

/** Trade[].length represents "Volume" */
export async function getTradesWithin24HoursByTypeId(typeId: string | number): Promise<Trade[]> {
  const res = await db.query(`
    SELECT
      trade_id as "tradeId",
      contract_id as "contractId",
      type_id as "typeId",
      buyer_id as "buyerId",
      seller_id as "sellerId",
      sale_price as "salePrice",
      sale_cost as "saleCost",
      trade_fee as "tradeFee",
      created_at as "createdAt"
    FROM trades
      WHERE type_id=$1
        AND created_at >= NOW() - INTERVAL '1 day'
  `, [typeId]);
  return res.rows;
}

/** Represents "Change" */
export async function getTradeAvgSalePrice24HourChange(typeId: string | number): Promise<number> {
  const res = await db.query(`
    SELECT ROUND((
      SELECT AVG(sale_price)
        FROM trades
          WHERE type_id=$1
            AND created_at >= NOW() - INTERVAL '1 day'
    ) - (
      SELECT AVG(sale_price)
        FROM trades
          WHERE type_id=$1
            AND created_at >= NOW() - INTERVAL '2 days'
            AND created_at < NOW() - INTERVAL '1 day'
    )::numeric, 2) as "salePriceAvg"
  `, [typeId]);
  return res.rows[0].salePriceAvg !== null ? Number(res.rows[0].salePriceAvg) : 0;
}

// INTERNAL METHOD: NOT TO BE USED BY ANY ROUTES
export async function _createTrade(
  contractId: number,
  typeId: number,
  buyerId: number,
  salePrice: number,
  saleCost: number,
  tradeFee: number,
  client: PoolClient,
  sellerId?: number,
): Promise<{tradeId: number}> {
  const res = await client.query(`
    INSERT INTO trades (
      contract_id,
      type_id,
      buyer_id,
      seller_id,
      sale_price,
      sale_cost,
      trade_fee
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )
    RETURNING trade_id as "tradeId"
  `,
  [
    contractId,
    typeId,
    buyerId,
    sellerId,
    salePrice,
    saleCost,
    tradeFee
  ]);
  return res.rows[0];
}

// TODO: Define a function to get the last sale price for a contractType