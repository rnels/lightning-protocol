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

// TODO: Add process of creating locks here
// TODO: Consider potential bug if I am procedurally creating locks where running out of locks to create during the process could result in an exception with the locks still created
// I suppose it wouldn't be an issue if I summed up the total unlocked amounts for the pool before committing to creating locks
export function createContract(contract: Contract) {
  return db.query(`
    INSERT INTO contracts (
      type_id,
      owner_id,
      ask_price,
      asset_amount,
      exercised
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING contract_id
  `,
  [
    contract.typeId,
    contract.ownerId,
    contract.askPrice,
    contract.assetAmount,
    contract.exercised
  ]);
};

export function updateAskPrice(contractId: string | number, askPrice: number, ownerId: string | number) {
  return db.query(`
    UPDATE contracts
    SET ask_price=$2
      WHERE contract_id=$1
        AND owner_id=$3
  `,
  [
    contractId,
    askPrice,
    ownerId
  ]);
};

// TODO: Flesh this out as needed
export function updateExercised(contractId: string | number, exercised: boolean, ownerId: string | number) {
  return db.query(`
    UPDATE contracts
    SET exercised=$2
      WHERE contract_id=$1
        AND owner_id=$3
  `,
  [
    contractId,
    exercised,
    ownerId
  ]);
};
