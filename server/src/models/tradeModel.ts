import db from '../db/db';
import { Trade } from '../types';

export function getAllTrades(sort='trade_id ASC', count=10) {
  return db.query(`
    SELECT *
      FROM trades
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
};

export function getTradeById(id: number) {
  return db.query(`
    SELECT *
      FROM trades
      WHERE trade_id=$1
  `, [id]);
};

export function getTradesByContractId(contractId: number) {
  return db.query(`
    SELECT *
      FROM trades
      WHERE contract_id=$1
  `, [contractId]);
};

// Returns both trades for an account as a buyer and a seller
export function getAllTradesByAccountId(accountId: number) {
  return db.query(`
    SELECT *
      FROM trades
      WHERE buyer_id=$1
        OR seller_id=$1
  `, [accountId]);
};

export function createTrade(trade: Trade) {
  return db.query(`
    INSERT INTO trades (
      contract_id,
      buyer_id,
      seller_id,
      sale_price
    ) VALUES (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING trade_id
  `,
  [
    trade.contractId,
    trade.buyerId,
    trade.sellerId,
    trade.salePrice
  ]);
};