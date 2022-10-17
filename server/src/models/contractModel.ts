import db from '../db/db';
import { Contract } from '../types';

export function getAllContracts(sort='contract_id ASC', count=10) {
  return db.query(`
    SELECT *
      FROM contracts
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
};

export function getContractById(id: number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE contract_id=$1
  `, [id]);
};

export function getContractsByTypeId(typeId: number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE type_id=$1
  `, [typeId]);
};

export function getContractsByBuyerId(buyerId: number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE buyer_id=$1
  `, [buyerId]);
};

export function createContract(contract: Contract) {
  return db.query(`
    INSERT INTO contracts (
      type_id,
      buyer_id,
      pool_id,
      ask_price
    ) VALUES (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING contract_id
  `,
  [
    contract.typeId,
    contract.buyerId,
    contract.poolId,
    contract.askPrice
  ]);
};
