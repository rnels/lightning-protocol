import db from '../db/db';
import { ContractType } from '../types';

export async function getAllContractTypes(sort='contract_type_id ASC'): Promise<ContractType[]> {
  const res = await db.query(`
    SELECT
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
      asset_amount as "assetAmount",
      direction,
      strike_price as "strikePrice",
      expires_at as "expiresAt"
    FROM contract_types
    ORDER BY $1
  `, [sort]);
  return res.rows;
}

export async function getContractTypeById(id: string | number): Promise<ContractType> {
  const res = await db.query(`
    SELECT
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
      asset_amount as "assetAmount",
      direction,
      strike_price as "strikePrice",
      expires_at as "expiresAt"
    FROM contract_types
      WHERE contract_type_id=$1
  `, [id]);
  return res.rows[0];
}

// Get contract type by type ID (if exists and non-expired)
export async function getActiveContractTypeById(id: string | number): Promise<ContractType> {
  const res = await db.query(`
    SELECT
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
      asset_amount as "assetAmount",
      direction,
      strike_price as "strikePrice",
      expires_at as "expiresAt"
    FROM contract_types
      WHERE contract_type_id=$1
        AND expires_at > NOW()
  `, [id]);
  return res.rows[0];
}

// Get a list of contract asks by contract type ID (if exists and non-expired)
export async function getAskPricesByTypeId(id: string | number): Promise<{askPrice: number, contractId: number}[]> {
  const res = await db.query(`
    SELECT
      contracts.contract_id as "contractId",
      contracts.ask_price as "askPrice"
    FROM contracts, contract_types
      WHERE contract_types.contract_type_id=$1
        AND contract_types.contract_type_id=contracts.type_id
        AND contract_types.expires_at > NOW()
        AND contracts.ask_price IS NOT NULL
  `, [id]);
  return res.rows;
}

// Get active (non-expired) contract types
export async function getActiveContractTypesByAssetId(assetId: string | number): Promise<ContractType[]> {
  const res = await db.query(`
    SELECT
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
      asset_amount as "assetAmount",
      direction,
      strike_price as "strikePrice",
      expires_at as "expiresAt"
    FROM contract_types
      WHERE asset_id=$1
        AND expires_at > NOW()
    ORDER BY expires_at ASC
  `, [assetId]);
  return res.rows;
}

export async function createContractType(contractType: ContractType): Promise<{contractTypeId: number}> {
  const res = await db.query(`
    INSERT INTO contract_types (
      asset_id,
      asset_amount,
      direction,
      strike_price,
      expires_at
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      to_timestamp($5)
    )
    RETURNING contract_type_id as "contractTypeId"
  `,
  [
    contractType.assetId,
    contractType.assetAmount,
    contractType.direction,
    contractType.strikePrice,
    contractType.expiresAt // TODO: Ensure that this is what we want to do going forward, converting epoch to TIMESTAMP with to_timestamp()
  ]);
  return res.rows[0];
}
