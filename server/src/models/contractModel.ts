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

export function getContractById(id: string | number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE contract_id=$1
  `, [id]);
};

export function getContractsByTypeId(typeId: string | number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE type_id=$1
  `, [typeId]);
};

export function getContractsByOwnerId(ownerId: string | number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE owner_id=$1
  `, [ownerId]);
};

export function createContract(contract: Contract) {
  return db.query(`
    INSERT INTO contracts (
      type_id,
      owner_id,
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
    contract.ownerId,
    contract.poolId,
    contract.askPrice
  ]);
};
