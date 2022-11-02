import db from '../db/db';
import { getAssetPriceFromAPI } from '../assets/price';
import { Asset, AssetType } from '../types';

async function _checkIfAssetPriceHistoryExists(
  assetId: number,
  dataPeriod: number
): Promise<boolean> {
  return (await db.query(`
    SELECT EXISTS(
      SELECT asset_price_id
        FROM asset_prices
          WHERE asset_id=$1
            AND data_period=to_timestamp($2)::date
    )
  `,
  [
    assetId,
    dataPeriod
  ])).rows[0].exists;
};

// TODO: Set this up with a listener that automatically updates it periodically, rather than attaching it to getAssetPriceById()
async function _updateAssetPrice(
  assetId: number,
  assetType: AssetType,
  priceApiId: number
): Promise<number> {
  let lastPrice = await getAssetPriceFromAPI(priceApiId, assetType);
  await db.query(`
    UPDATE assets
      SET
        last_price=$2,
        last_updated=NOW()
      WHERE asset_id=$1
  `,
  [
    assetId,
    lastPrice
  ]);
  return lastPrice;
};

export async function getAllAssets(sort='asset_id ASC'): Promise<Asset[]> {
  const res = await db.query(`
    SELECT
      asset_id as "assetId",
      asset_type as "assetType",
      asset_amount as "assetAmount",
      name,
      symbol,
      last_price as "lastPrice",
      last_updated as "lastUpdated",
      price_api_id as "priceApiId",
      icon_url as "iconUrl"
    FROM assets
    ORDER BY $1
  `, [sort]);
  return res.rows;
};

export async function getAssetById(id: string | number): Promise<Asset> {
  const res = await db.query(`
    SELECT
      asset_id as "assetId",
      asset_type as "assetType",
      asset_amount as "assetAmount",
      name,
      symbol,
      last_price as "lastPrice",
      last_updated as "lastUpdated",
      price_api_id as "priceApiId",
      icon_url as "iconUrl"
    FROM assets
      WHERE asset_id=$1
  `, [id]);
  return res.rows[0];
};

/** Calling this gives us the chance to update the asset price, done on an hourly maximum */
export async function getAssetPriceById(id: string | number): Promise<number> {
  const res = (await db.query(`
    SELECT
      asset_id as "assetId",
      asset_type as "assetType",
      last_price as "lastPrice",
      last_updated as "lastUpdated",
      price_api_id as "priceApiId"
    FROM assets
      WHERE asset_id=$1
  `, [id])).rows[0];
  let lastPrice = res.lastPrice;
  let lastUpdatedHours = (Date.now() - new Date(res.lastUpdated).getTime()) / 3600000
  if (lastUpdatedHours >= 1) { // Update price if it's been over 1 hour since last update
    try {
      lastPrice = await _updateAssetPrice(res.assetId, res.assetType, res.priceApiId);
    } catch {
      lastPrice = res.lastPrice; // Probably not needed
    }
  }
  return Number(lastPrice);
};

export async function getAssetsByAssetType(assetType: string): Promise<Asset[]> {
  const res = await db.query(`
    SELECT
      asset_id as "assetId",
      asset_type as "assetType",
      asset_amount as "assetAmount",
      name,
      symbol,
      last_price as "lastPrice",
      last_updated as "lastUpdated",
      price_api_id as "priceApiId",
      icon_url as "iconUrl"
    FROM assets
      WHERE asset_type=$1
  `, [assetType]);
  return res.rows;
};

export async function createAsset(
  assetType: AssetType,
  assetAmount: number,
  name: string,
  symbol: string,
  priceApiId: number,
  iconUrl?: string
): Promise<{assetId: number}> {
  let lastPrice = await getAssetPriceFromAPI(priceApiId, assetType);
  const res = await db.query(`
    INSERT INTO assets (
      asset_type,
      asset_amount,
      name,
      symbol,
      price_api_id,
      last_price,
      icon_url
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )
    RETURNING asset_id as "assetId"
  `,
  [
    // NOTE: This structure of inserting undefined on optional properties DOES work
    assetType,
    assetAmount,
    name,
    symbol,
    priceApiId,
    lastPrice,
    iconUrl
  ]);
  return res.rows[0];
};

// TODO: Cast price to numeric
export async function _getAssetPriceHistoryByAssetId(assetId: number): Promise<{price: string, data_period: string}[]>{
  return (await db.query(`
    SELECT price, data_period
      FROM asset_prices
        WHERE asset_id=$1
      ORDER BY data_period DESC
  `,
  [
    assetId,
  ])).rows;
};

/** Can be used to limit the query results for limited lookback in calculating greeks / volatility */
// TODO: Cast price to numeric
export async function _getAssetPriceHistoryByAssetIdLimit(
  assetId: number,
  limit: number
): Promise<{price: string, data_period: string}[]>{
  return (await db.query(`
    SELECT price, data_period
      FROM asset_prices
        WHERE asset_id=$1
      ORDER BY data_period DESC
      LIMIT $2
  `,
  [
    assetId,
    limit
  ])).rows;
};

export async function _createAssetPriceHistoryIfNotExists(
  assetId: number,
  price: number,
  dataPeriod: number
) {
  let exists = await _checkIfAssetPriceHistoryExists(assetId, dataPeriod);
  if (exists) return;
  return db.query(`
    INSERT INTO asset_prices (
      asset_id,
      price,
      data_period
    ) VALUES (
      $1, $2, to_timestamp($3)::date
    )
  `,
  [
    assetId,
    price,
    dataPeriod
  ]);
};

