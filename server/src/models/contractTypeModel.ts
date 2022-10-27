import db from '../db/db';
import { ContractType } from '../types';

// NOTE: Should not be used by anything that creates a new contract or references existing contracts
export async function getContractTypeById(id: string | number): Promise<ContractType> {
  const res = await db.query(`
    SELECT
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
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
    ORDER BY contracts.ask_price ASC
  `, [id]);
  return res.rows;
}

// Get active (non-expired) contract types by assetID
export async function getActiveContractTypesByAssetId(assetId: string | number): Promise<ContractType[]> {
  const res = await db.query(`
    SELECT
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
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

export async function createContractType(
  assetId: number,
  direction: boolean,
  strikePrice: number,
  expiresAt: number
): Promise<{contractTypeId: number}> {
  const res = await db.query(`
    INSERT INTO contract_types (
      asset_id,
      direction,
      strike_price,
      expires_at
    ) VALUES (
      $1,
      $2,
      $3,
      to_timestamp($4)
    )
    RETURNING contract_type_id as "contractTypeId"
  `,
  [
    assetId,
    direction,
    strikePrice,
    expiresAt // TODO: Ensure that this is what we want to do going forward, converting epoch to TIMESTAMP with to_timestamp()
  ]);
  return res.rows[0];
}
