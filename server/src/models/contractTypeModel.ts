import db from '../db/db';
import { ContractType } from '../types';

export function getAllContractTypes(sort='contract_type_id ASC', count=10) {
  return db.query(`
    SELECT *
      FROM contract_types
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
};

export function getContractTypeById(id: string | number) {
  return db.query(`
    SELECT *
      FROM contract_types
      WHERE contract_type_id=$1
  `, [id]);
};

export function getContractTypesByListingId(listingId: string | number) {
  return db.query(`
    SELECT *
      FROM contract_types
      WHERE listing_id=$1
  `, [listingId]);
};

export function createContractType(contractType: ContractType) {
  return db.query(`
    INSERT INTO contract_types (
      listing_id,
      direction,
      strike_price,
      expires_at
    ) VALUES (
      $1,
      $2,
      $3,
      to_timestamp($4)
    )
    RETURNING contract_type_id
  `,
  [
    contractType.listingId,
    contractType.direction,
    contractType.strikePrice,
    contractType.expiresAt // TODO: Ensure that this is what we want to do going forward, converting epoch to TIMESTAMP with to_timestamp()
  ]);
};
