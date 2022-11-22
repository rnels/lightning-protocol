import { PoolClient } from 'pg';
import db from '../db/db';
import { ContractType } from '../types';
import { getAssetPriceById } from './assetModel';
import { getActiveContractsByTypeId } from './contractModel';
import { _getLockedPoolsByContractId } from './poolModel';

/** Used when put option is approaching strike price, converts assets to reserved liquidity equating to asset value at strikePrice x assetAmount, can be used to pay contract owner if they choose to exercise contract.
 * The first part simulates a stop loss / limit order.
 */
// NOTE: Currently calling this within _updateAssetPrice()
export async function _convertActivePutContractTypesNearStrike(assetId: number, assetPrice: number) {
  let client = await db.connect();
  try {
    await client.query('BEGIN');
    const contractTypes = (await client.query(`
      SELECT
        contract_type_id as "contractTypeId",
        asset_id as "assetId",
        direction,
        strike_price as "strikePrice",
        expires_at as "expiresAt"
      FROM contract_types
        WHERE direction=false
          AND asset_id=$1
          AND expires_at > NOW()
    `, [assetId])).rows as ContractType[];
    let typeReservePromises = [];
    for (let contractType of contractTypes) { // TODO: Could group by strike price, since that's what is being evaluated
      let strikePrice = Number(contractType.strikePrice);
      let priceDif = (assetPrice - strikePrice) / strikePrice; // Decimal representing difference between asset price and strike
      let creditPrice = priceDif < 0 ? Math.abs(assetPrice - strikePrice) : 0;
      // TODO: Consider making a "credited reserves" for each pool lock
      // where if it wasn't updated in time before dipping below 0% priceDif, there's an account
      // which funds the lock temporarily so it can still be exercised
      if (priceDif < 0.05) { // If difference is less than 5%, time to put into the reserves
        let contracts = await getActiveContractsByTypeId(contractType.contractTypeId, client);
        for (let contract of contracts) {
          let poolLocks = await _getLockedPoolsByContractId(contract.contractId, client);
          for (let poolLock of poolLocks) {
            // Represents selling at the assetPrice, implied that there's a limit order
            // This is something that will be expressed much differently in the blockchain application
            // TODO: Consolidate this with the logic in _addToPoolLockReserveAmount()
            let assetAmount = Number(poolLock.assetAmount);
            let creditReserve = creditPrice * assetAmount;
            // NOTE: This conditional is the only thing keeping it from converting assets to reserves any number of times
            // It's important that it's done this way because I can't subtract asset_amount from the pool lock
            // if I want to keep track of how much it contributed to the contract
            if (!Number(poolLock.reserveAmount)) {
              let addReserve = creditReserve ? strikePrice * assetAmount : assetPrice * assetAmount;
              typeReservePromises.push(
                client.query(`
                  UPDATE pools
                    SET asset_amount=asset_amount-$2
                      WHERE pool_id=$1
                `,[poolLock.poolId, assetAmount]),
                client.query(`
                  UPDATE pool_locks
                    SET
                      reserve_amount=$2,
                      reserve_credit=$3
                    WHERE pool_lock_id=$1
                `,[poolLock.poolLockId, addReserve, creditReserve])
              );
            }
          }
        }
      }
    }
    await Promise.all(typeReservePromises);
    await client.query('COMMIT');
  }
  catch {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

// NOTE: Should not be used by anything that creates a new contract or references existing contracts
export async function getContractTypeById(id: string | number, client?: PoolClient): Promise<ContractType> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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
export async function getActiveContractTypeById(id: string | number, client?: PoolClient): Promise<ContractType> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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
  if (res.rows.length === 0) {
    throw new Error('There is no active contract type associated with this type ID');
  }
  return res.rows[0];
}

// Get a list of contract asks by contract type ID (if exists and non-expired)
export async function getAskPricesByTypeId(id: string | number, client?: PoolClient): Promise<{askPrice: number, contractId: number}[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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
export async function getActiveContractTypesByAssetId(assetId: string | number, client?: PoolClient): Promise<ContractType[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
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

export async function getContractTypesByAssetId(assetId: string | number): Promise<ContractType[]> {
  const res = await db.query(`
    SELECT
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
      direction,
      strike_price as "strikePrice",
      expires_at as "expiresAt"
    FROM contract_types
      WHERE asset_id=$1
  `, [assetId]);
  return res.rows;
}

// TODO: Create checks so I'm not creating duplicate contract types
export async function createContractType(
  assetId: number,
  direction: boolean,
  strikePrice: number,
  expiresAt: Date | string
): Promise<ContractType> {
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
      $4
    )
    RETURNING
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
      direction,
      strike_price as "strikePrice",
      expires_at as "expiresAt"
  `,
  [
    assetId,
    direction,
    strikePrice,
    expiresAt
  ]);
  return res.rows[0];
}

