import { PoolClient } from 'pg';
import db from '../db/db';
import { ContractType } from '../types';
import { getAssetPriceById } from './assetModel';
import { getActiveContractsByTypeId } from './contractModel';
import { _getLockedPoolsByContractId } from './poolModel';

/** Used when put option is approaching strike price, converts assets to reserved liquidity equating to asset value at strikePrice x assetAmount, can be used to pay contract owner if they choose to exercise contract.
 * The first part simulates a stop loss / limit order.
 */
// TODO: Have this called somewhere periodically, possibly whenever asset price is updated for an assetId? Would need to pass it an assetId in that case
// TODO: Consider adding another property to the schema for put contractTypes which marks if they've already converted or not. Otherwise this could trigger repeatedly every price change beneath the 5% margin. It won't make any changes due to the checking, it'll just be expensive. If we have that flag, the initial list of contractTypes won't include converted ones, saving on all the rest. The only caveat is that if a contract was created for a type after it had already marked as converted, it wouldn't go through the process with the contract. I suppose it does have to be bound to the pool locks in that case. Not ideal, but I'll think on it more
async function _convertActivePutContractTypesNearStrike() {
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
          AND expires_at > NOW()
    `)).rows as ContractType[];
    let typeReservePromises = [];
    for (let contractType of contractTypes) { // TODO: Could group by strike price, since that's what is being evaluated
      let assetPrice = await getAssetPriceById(contractType.assetId, client);
      let priceDif = (assetPrice - contractType.strikePrice) / contractType.strikePrice; // Decimal representing difference between asset price and strike
      if (priceDif < 0.05) { // If difference is less than 5%, time to put into the reserves
        let contracts = await getActiveContractsByTypeId(contractType.contractTypeId, client);
        for (let contract of contracts) {
          let lockPools = await _getLockedPoolsByContractId(contract.contractId, client);
          for (let pool of lockPools) {
            // Represents selling at the strike price, implied that there's a limit order
            // Don't worry about the fact that there would be a margin between limit price and actual sale value
            // This is something that will be expressed much differently in the blockchain application
            let addReserve = contractType.strikePrice * pool.assetAmount;
            if (!pool.reserveAmount) {
              typeReservePromises.push(
                client.query(`
                  UPDATE pools
                    SET asset_amount=asset_amount-$2
                      WHERE pool_id=$1
                `,[pool.poolId, pool.assetAmount]),
                client.query(`
                  UPDATE pool_locks
                    SET
                      asset_amount=0,
                      reserve_amount=$2
                    WHERE pool_lock_id=$1
                `,[pool.poolLockId, addReserve])
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

export async function createContractType(
  assetId: number,
  direction: boolean,
  strikePrice: number,
  expiresAt: Date
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
      $4
    )
    RETURNING contract_type_id as "contractTypeId"
  `,
  [
    assetId,
    direction,
    strikePrice,
    expiresAt
  ]);
  return res.rows[0];
}

