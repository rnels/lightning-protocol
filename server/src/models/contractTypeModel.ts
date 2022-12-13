import { PoolClient } from 'pg';
import db from '../db/db';
import { ContractType } from '../types';
import { getAssetPriceById } from './assetModel';
import { getActiveContractsByTypeId } from './contractModel';
import { _getPoolLocksByContractId } from './poolModel';

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
          let poolLocks = await _getPoolLocksByContractId(contract.contractId, client);
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
                      asset_amount=0,
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

async function getActiveContractTypesByAssetAndDirection(assetId: string | number, direction: boolean, client?: PoolClient): Promise<ContractType[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
      direction,
      strike_price as "strikePrice",
      expires_at as "expiresAt"
    FROM contract_types
      WHERE
        asset_id=$1 AND
        direction=$2 AND
        expires_at > NOW()
  `, [assetId, direction]);
  return res.rows;
}

/** Used for generating featured contract types */
async function getActiveContractTypesByLeastTraded(assetId: string | number, direction: boolean, limit=6, client?: PoolClient): Promise<ContractType[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const res = await query(`
    SELECT
      contract_types.contract_type_id as "contractTypeId",
      contract_types.asset_id as "assetId",
      contract_types.direction as "direction",
      contract_types.strike_price as "strikePrice",
      contract_types.expires_at as "expiresAt"
    FROM contract_types, trades
      WHERE
        contract_types.asset_id=$1 AND
        contract_types.direction=$2 AND
        contract_types.expires_at > NOW() AND
        trades.type_id=contract_types.contract_type_id
    GROUP BY contract_types.contract_type_id
      ORDER BY COUNT(trades.trade_id)
    LIMIT $3
  `, [assetId, direction, limit]);
  return res.rows;
}

/** Ranked by highest strike, far time to expiry */
async function getHighStrikeFarExpiryTypes(assetId: string | number, direction: boolean, limitDivisor=1, client?: PoolClient): Promise<ContractType[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const epochMin = Number((await query(`
    SELECT
      MIN(extract(epoch from expires_at)) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, direction])).rows[0].min);
  const epochMax = Number((await query(`
    SELECT
      MAX(extract(epoch from expires_at)) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, direction])).rows[0].max);
  let epochDif = epochMax - epochMin;
  if (epochDif === 0) epochDif = epochMax; // Prevents dividing by 0 if there's only one expires_at across contractTypes
  const strikeMin = Number((await query(`
    SELECT
      MIN(strike_price) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, direction])).rows[0].min);
  const strikeMax = Number((await query(`
    SELECT
      MAX(strike_price) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, direction])).rows[0].max);
  let strikeDif = strikeMax - strikeMin;
  if (strikeDif === 0) strikeDif = strikeMax; // Prevents dividing by 0 if there's only one strike_price across contractTypes
  const res = await query(`
    SELECT
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
      direction,
      strike_price as "strikePrice",
      expires_at as "expiresAt"
    FROM contract_types
      WHERE
        asset_id=$1 AND direction=$2
    ORDER BY
    ((extract(epoch from expires_at) - $4) / $5)
    +
    ((strike_price - $6) / $7)
    DESC
      LIMIT (SELECT COUNT(*) / $3 from contract_types)
  `, [assetId, direction, limitDivisor, epochMin, epochDif, strikeMin, strikeDif]);
  return res.rows;
}

/** Ranked by lowest strike, far time to expiry */
async function getLowStrikeFarExpiryTypes(assetId: string | number, direction: boolean, limitDivisor=1, client?: PoolClient): Promise<ContractType[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const epochMin = Number((await query(`
    SELECT
      MIN(extract(epoch from expires_at)) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, direction])).rows[0].min);
  const epochMax = Number((await query(`
    SELECT
      MAX(extract(epoch from expires_at)) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, direction])).rows[0].max);
  let epochDif = epochMax - epochMin;
  if (epochDif === 0) epochDif = epochMax; // Prevents dividing by 0 if there's only one expires_at across contractTypes
  const strikeMin = Number((await query(`
    SELECT
      MIN(strike_price) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, direction])).rows[0].min);
  const strikeMax = Number((await query(`
    SELECT
      MAX(strike_price) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, direction])).rows[0].max);
  let strikeDif = strikeMax - strikeMin;
  if (strikeDif === 0) strikeDif = strikeMax; // Prevents dividing by 0 if there's only one strike_price across contractTypes
  const res = await query(`
    SELECT
      contract_type_id as "contractTypeId",
      asset_id as "assetId",
      direction,
      strike_price as "strikePrice",
      expires_at as "expiresAt"
    FROM contract_types
      WHERE
        asset_id=$1 AND direction=$2
    ORDER BY
    ((extract(epoch from expires_at) - $4) / $5)
    -
    ((strike_price - $6) / $7)
    DESC
      LIMIT (SELECT COUNT(*) / $3 from contract_types)
  `, [assetId, direction, limitDivisor, epochMin, epochDif, strikeMin, strikeDif]);
  return res.rows;
}

/** Represents "Highest potential" for calls: Far (highest) strike, far time to expiry */
export async function getHighestPotentialCallTypeForAssetId(assetId: string | number, assetPrice?: number, client?: PoolClient): Promise<ContractType | void> {
  let res = await Promise.all([
      getHighStrikeFarExpiryTypes(assetId, true, 1, client),
      assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0];
  assetPrice = res[1];
  for (let contractType of contractTypes) {
    if (contractType.strikePrice > assetPrice) {
      if (!contractType.badges) {
        contractType.badges = [];
      }
      contractType.badges.push('potential');
      return contractType;
    }
  }
}

export async function getTPHighestPotentialCallTypeForTypeIds(assetId: string | number, checkTypes: ContractType[], assetPrice?: number, client?: PoolClient): Promise<ContractType[]> {
  let res = await Promise.all([
      getHighStrikeFarExpiryTypes(assetId, true, 4, client),
      assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0];
  assetPrice = res[1];
  let checkTypeIds = checkTypes.map((type) => type.contractTypeId);
  for (let contractType of contractTypes) { // Works its way down sequentially
    if (contractType.strikePrice > assetPrice) {
      let index = checkTypeIds.indexOf(contractType.contractTypeId);
      if (index !== -1) {
        if (!checkTypes[index].badges) {
          checkTypes[index].badges = [];
        }
        checkTypes[index].badges!.push('potential');
        return checkTypes;
      }
    }
  }
  return checkTypes;
}

/** Represents "Highest potential" for puts: Far (lowest) strike, far time to expiry */
export async function getHighestPotentialPutTypeForAssetId(assetId: string | number, assetPrice?: number, client?: PoolClient): Promise<ContractType | void> {
  let res = await Promise.all([
      getLowStrikeFarExpiryTypes(assetId, false, 1, client),
      assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0];
  assetPrice = res[1];
  for (let contractType of contractTypes) {
    if (contractType.strikePrice < assetPrice) {
      if (!contractType.badges) {
        contractType.badges = [];
      }
      contractType.badges.push('potential');
      return contractType;
    }
  }
}

export async function getTPHighestPotentialPutTypeForTypeIds(assetId: string | number, checkTypes: ContractType[], assetPrice?: number, client?: PoolClient): Promise<ContractType[]> {
  let res = await Promise.all([
      getHighStrikeFarExpiryTypes(assetId, false, 4, client),
      assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0];
  assetPrice = res[1];
  let checkTypeIds = checkTypes.map((type) => type.contractTypeId);
  for (let contractType of contractTypes) {
    if (contractType.strikePrice < assetPrice) {
      let index = checkTypeIds.indexOf(contractType.contractTypeId);
      if (index !== -1) {
        if (!checkTypes[index].badges) {
          checkTypes[index].badges = [];
        }
        checkTypes[index].badges!.push('potential');
        return checkTypes;
      }
    }
  }
  return checkTypes;
}

/** Represents "Safest bet" for calls: Close (lowest) strike, far time to expiry */
export async function getSafestBetCallTypeForAssetId(assetId: string | number, assetPrice?: number, client?: PoolClient): Promise<ContractType | void> {
  let res = await Promise.all([
      getLowStrikeFarExpiryTypes(assetId, true, 1, client),
      assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0];
  assetPrice = res[1];
  for (let contractType of contractTypes) {
    if (contractType.strikePrice > assetPrice) {
      if (!contractType.badges) {
        contractType.badges = [];
      }
      contractType.badges.push('safe');
      return contractType;
    }
  }
}

export async function getTPSafestBetCallTypeForAssetId(assetId: string | number, checkTypes: ContractType[], assetPrice?: number, client?: PoolClient): Promise<ContractType[]> {
  let res = await Promise.all([
      getLowStrikeFarExpiryTypes(assetId, true, 10, client),
      assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0];
  assetPrice = res[1];
  let checkTypeIds = checkTypes.map((type) => type.contractTypeId);
  for (let contractType of contractTypes) {
    if (contractType.strikePrice > assetPrice) {
      let index = checkTypeIds.indexOf(contractType.contractTypeId);
      if (index !== -1) {
        if (!checkTypes[index].badges) {
          checkTypes[index].badges = [];
        }
        checkTypes[index].badges!.push('safe');
        return checkTypes;
      }
    }
  }
  return checkTypes;
}

/** Represents "Safest bet" for puts: Close (highest) strike, far time to expiry */
export async function getSafestBetPutTypeForAssetId(assetId: string | number, assetPrice?: number, client?: PoolClient): Promise<ContractType | void> {
  let res = await Promise.all([
      getHighStrikeFarExpiryTypes(assetId, false, 1, client),
      assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0];
  assetPrice = res[1];
  for (let contractType of contractTypes) {
    if (contractType.strikePrice < assetPrice) {
      if (!contractType.badges) {
        contractType.badges = [];
      }
      contractType.badges.push('safe');
      return contractType;
    }
  }
}

export async function getTPSafestBetPutTypeForAssetId(assetId: string | number, checkTypes: ContractType[], assetPrice?: number, client?: PoolClient): Promise<ContractType[]> {
  let res = await Promise.all([
      getHighStrikeFarExpiryTypes(assetId, false, 4, client),
      assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0];
  assetPrice = res[1];
  let checkTypeIds = checkTypes.map((type) => type.contractTypeId);
  for (let contractType of contractTypes) {
    if (contractType.strikePrice < assetPrice) {
      let index = checkTypeIds.indexOf(contractType.contractTypeId);
      if (index !== -1) {
        if (!checkTypes[index].badges) {
          checkTypes[index].badges = [];
        }
        checkTypes[index].badges!.push('safe');
        return checkTypes;
      }
    }
  }
  return checkTypes;
}

/** Represents "Wildcard" for calls: Far (highest) strike, close time to expiry */
// TODO: Put higher weight on expires_at
export async function getWildcardCallTypeForAssetId(assetId: string | number, assetPrice?: number, client?: PoolClient): Promise<ContractType | void> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const epochMin = Number((await query(`
    SELECT
      MIN(extract(epoch from expires_at)) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, true])).rows[0].min);
  const epochMax = Number((await query(`
    SELECT
      MAX(extract(epoch from expires_at)) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, true])).rows[0].max);
  let epochDif = epochMax - epochMin;
  if (epochDif === 0) epochDif = epochMax; // Prevents dividing by 0 if there's only one expires_at across contractTypes
  const strikeMin = Number((await query(`
    SELECT
      MIN(strike_price) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, true])).rows[0].min);
  const strikeMax = Number((await query(`
    SELECT
      MAX(strike_price) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, true])).rows[0].max);
  let strikeDif = strikeMax - strikeMin;
  if (strikeDif === 0) strikeDif = strikeMax; // Prevents dividing by 0 if there's only one strike_price across contractTypes
  let res = await Promise.all([
    query(`
      SELECT
        contract_type_id as "contractTypeId",
        asset_id as "assetId",
        direction,
        strike_price as "strikePrice",
        expires_at as "expiresAt"
      FROM contract_types
        WHERE
          asset_id=$1 AND direction=true
      ORDER BY
      (1 - (extract(epoch from expires_at) - $2) / $3)
      +
      ((strike_price - $4) / $5)
      DESC
    `, [assetId, epochMin, epochDif, strikeMin, strikeDif]),
    assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0].rows as ContractType[];
  assetPrice = res[1];
  for (let contractType of contractTypes) {
    if (contractType.strikePrice > assetPrice) {
      if (!contractType.badges) {
        contractType.badges = [];
      }
      contractType.badges.push('wild');
      return contractType;
    }
  }
}

export async function getTPWildcardCallTypeForAssetId(assetId: string | number, checkTypes: ContractType[], assetPrice?: number, limitDivisor=4, client?: PoolClient): Promise<ContractType[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const epochMin = Number((await query(`
    SELECT
      MIN(extract(epoch from expires_at)) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, true])).rows[0].min);
  const epochMax = Number((await query(`
    SELECT
      MAX(extract(epoch from expires_at)) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, true])).rows[0].max);
  let epochDif = epochMax - epochMin;
  if (epochDif === 0) epochDif = epochMax; // Prevents dividing by 0 if there's only one expires_at across contractTypes
  const strikeMin = Number((await query(`
    SELECT
      MIN(strike_price) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, true])).rows[0].min);
  const strikeMax = Number((await query(`
    SELECT
      MAX(strike_price) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, true])).rows[0].max);
  let strikeDif = strikeMax - strikeMin;
  if (strikeDif === 0) strikeDif = strikeMax; // Prevents dividing by 0 if there's only one strike_price across contractTypes
  let res = await Promise.all([
    query(`
      SELECT
        contract_type_id as "contractTypeId",
        asset_id as "assetId",
        direction,
        strike_price as "strikePrice",
        expires_at as "expiresAt"
      FROM contract_types
        WHERE
          asset_id=$1 AND direction=true
      ORDER BY
      (1 - (extract(epoch from expires_at) - $2) / $3)
      +
      ((strike_price - $4) / $5)
      DESC
        LIMIT (SELECT COUNT(*) / $6 from contract_types)
    `, [assetId, epochMin, epochDif, strikeMin, strikeDif, limitDivisor]),
    assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0].rows as ContractType[];
  assetPrice = res[1];
  let checkTypeIds = checkTypes.map((type) => type.contractTypeId);
  for (let contractType of contractTypes) {
    if (contractType.strikePrice > assetPrice) {
      let index = checkTypeIds.indexOf(contractType.contractTypeId);
      if (index !== -1) {
        if (!checkTypes[index].badges) {
          checkTypes[index].badges = [];
        }
        checkTypes[index].badges!.push('wild');
        return checkTypes;
      }
    }
  }
  return checkTypes;
}

/** Represents "Wildcard" for puts: Far (lowest) strike, close time to expiry */
// TODO: Put higher weight on expires_at
export async function getWildcardPutTypeForAssetId(assetId: string | number, assetPrice?: number, client?: PoolClient): Promise<ContractType | void> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const epochMin = Number((await query(`
    SELECT
      MIN(extract(epoch from expires_at)) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, false])).rows[0].min);
  const epochMax = Number((await query(`
    SELECT
      MAX(extract(epoch from expires_at)) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, false])).rows[0].max);
  let epochDif = epochMax - epochMin;
  if (epochDif === 0) epochDif = epochMax; // Prevents dividing by 0 if there's only one expires_at across contractTypes
  const strikeMin = Number((await query(`
    SELECT
      MIN(strike_price) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, false])).rows[0].min);
  const strikeMax = Number((await query(`
    SELECT
      MAX(strike_price) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, false])).rows[0].max);
  let strikeDif = strikeMax - strikeMin;
  if (strikeDif === 0) strikeDif = strikeMax; // Prevents dividing by 0 if there's only one strike_price across contractTypes
  let res = await Promise.all([
    query(`
      SELECT
        contract_type_id as "contractTypeId",
        asset_id as "assetId",
        direction,
        strike_price as "strikePrice",
        expires_at as "expiresAt"
      FROM contract_types
        WHERE
          asset_id=$1 AND direction=false
      ORDER BY
      (1 - (extract(epoch from expires_at) - $2) / $3)
      -
      ((strike_price - $4) / $5)
      DESC
    `, [assetId, epochMin, epochDif, strikeMin, strikeDif]),
    assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0].rows as ContractType[];
  assetPrice = res[1];
  for (let contractType of contractTypes) {
    if (contractType.strikePrice < assetPrice) {
      if (!contractType.badges) {
        contractType.badges = [];
      }
      contractType.badges.push('wild');
      return contractType;
    }
  }
}

/** Represents "Wildcard" for puts: Far (lowest) strike, close time to expiry */
// TODO: Put higher weight on expires_at
export async function getTPWildcardPutTypeForAssetId(assetId: string | number, checkTypes: ContractType[], assetPrice?: number, limitDivisor=4, client?: PoolClient): Promise<ContractType[]> {
  let query = client ? client.query.bind(client) : db.query.bind(db);
  const epochMin = Number((await query(`
    SELECT
      MIN(extract(epoch from expires_at)) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, false])).rows[0].min);
  const epochMax = Number((await query(`
    SELECT
      MAX(extract(epoch from expires_at)) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, false])).rows[0].max);
  let epochDif = epochMax - epochMin;
  if (epochDif === 0) epochDif = epochMax; // Prevents dividing by 0 if there's only one expires_at across contractTypes
  const strikeMin = Number((await query(`
    SELECT
      MIN(strike_price) as "min"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, false])).rows[0].min);
  const strikeMax = Number((await query(`
    SELECT
      MAX(strike_price) as "max"
    FROM contract_types
      WHERE asset_id=$1 AND direction=$2
  `, [assetId, false])).rows[0].max);
  let strikeDif = strikeMax - strikeMin;
  if (strikeDif === 0) strikeDif = strikeMax; // Prevents dividing by 0 if there's only one strike_price across contractTypes
  let res = await Promise.all([
    query(`
      SELECT
        contract_type_id as "contractTypeId",
        asset_id as "assetId",
        direction,
        strike_price as "strikePrice",
        expires_at as "expiresAt"
      FROM contract_types
        WHERE
          asset_id=$1 AND direction=false
      ORDER BY
      (1 - (extract(epoch from expires_at) - $2) / $3)
      -
      ((strike_price - $4) / $5)
      DESC
        LIMIT (SELECT COUNT(*) / $6 from contract_types)
    `, [assetId, epochMin, epochDif, strikeMin, strikeDif, limitDivisor]),
    assetPrice || getAssetPriceById(assetId, client)
  ]);
  let contractTypes = res[0].rows;
  assetPrice = res[1];
  let checkTypeIds = checkTypes.map((type) => type.contractTypeId);
  for (let contractType of contractTypes) {
    if (contractType.strikePrice < assetPrice) {
      let index = checkTypeIds.indexOf(contractType.contractTypeId);
      if (index !== -1) {
        if (!checkTypes[index].badges) {
          checkTypes[index].badges = [];
        }
        checkTypes[index].badges!.push('wild');
        return checkTypes;
      }
    }
  }
  return checkTypes;
}

// TODO: Have this add multiple badges for a contractType rather than returning multiple badged contractTypes
export async function getBadgedTypesForAssetAndDirection(assetId: string | number, direction: boolean): Promise<ContractType | any[]> {
  let assetPrice = await getAssetPriceById(assetId);
  return Promise.all(
    direction ?
    [
      getHighestPotentialCallTypeForAssetId(assetId, assetPrice),
      getSafestBetCallTypeForAssetId(assetId, assetPrice),
      getWildcardCallTypeForAssetId(assetId, assetPrice)
    ]
    :
    [
      getHighestPotentialPutTypeForAssetId(assetId, assetPrice),
      getSafestBetPutTypeForAssetId(assetId, assetPrice),
      getWildcardPutTypeForAssetId(assetId, assetPrice)
    ]
  );
}

/**
 * Well I just blew through creaing this without any kind of documentation of anything and it's messy and there's duped code
 * everywhere but whatever. This gives us up to 1 badge of each type if one of the contractTypes
 * in the types arg show up in the top 25th percentile. This means that in a given batch of contractTypes,
 * a badge can only show up once (but may not show up at all). This system is for displaying a set of contractTypes and allocating
 * badges where appropriate to that specific batch. I.e. I have a batch of 6 that I want to show to the end user, up to 3 badges can
 * be awarded across them (at this time, until I come up with more badges).
 * Also keep in mind, this function (and the functions it passes the types arg to) is intended to mutate the types array and return it, returning the same array as input by types, but with badges awarded.
 * TODO: Allow contractTypes to have multiple badges by changing the badge type: string => string[]
 * Also figure out if I want to keep the other system at all, which just returns the top contract types by badge type
 * */
export async function setBadgesOnContractTypeList(assetId: string | number, direction: boolean, types: ContractType[]): Promise<ContractType[]> {
  // types.forEach((type) => {
  //   if (type.assetId !== assetId || type.direction !== direction) {
  //     // Bandaid solution
  //     throw new Error('Can\'t mix contract types of different asset or direction');
  //   }
  // });
  let assetPrice = await getAssetPriceById(assetId);
  await Promise.all( // Mutate the types array objects with badges
    direction ?
    [
      getTPHighestPotentialCallTypeForTypeIds(assetId, types, assetPrice),
      getTPSafestBetCallTypeForAssetId(assetId, types, assetPrice),
      getTPWildcardCallTypeForAssetId(assetId, types, assetPrice)
    ]
    :
    [
      getTPHighestPotentialPutTypeForTypeIds(assetId, types, assetPrice),
      getTPSafestBetPutTypeForAssetId(assetId, types, assetPrice),
      getTPWildcardPutTypeForAssetId(assetId, types, assetPrice)
    ]
  );
  return types;
}

/** Get least traded contract types, badge em up, return em */
export async function getFeaturedContractTypes(assetId: string | number, direction: boolean): Promise<ContractType[]> {
  let contractTypes = await getActiveContractTypesByLeastTraded(assetId, direction);
  return setBadgesOnContractTypeList(assetId, direction, contractTypes);
}