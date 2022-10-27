import db from '../db/db';
import { getAssetPrice } from '../prices/getPrices';
import { Asset, AssetType } from '../types';

export async function getAllAssets(sort='asset_id ASC'): Promise<Asset[]> {
  const res = await db.query(`
    SELECT
      asset_id as "assetId",
      asset_type as "assetType",
      asset_amount as "assetAmount",
      name,
      symbol,
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
      price_api_id as "priceApiId",
      icon_url as "iconUrl"
    FROM assets
      WHERE asset_id=$1
  `, [id]);
  return res.rows[0];
};

export async function getAssetPriceById(id: string | number): Promise<{assetId: number, price: number}> {
  const res = (await db.query(`
    SELECT
      asset_id as "assetId",
      price_api_id as "priceApiId",
      asset_type as "assetType"
    FROM assets
      WHERE asset_id=$1
  `, [id])).rows[0];
  let price = await getAssetPrice(res.priceApiId, res.assetType);
  let assetInfo = {
    assetId: res.assetId,
    price
  };
  return assetInfo;
};

export async function getAssetsByAssetType(assetType: string): Promise<Asset[]> {
  const res = await db.query(`
    SELECT
      asset_id as "assetId",
      asset_type as "assetType",
      asset_amount as "assetAmount",
      name,
      symbol,
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
  const res = await db.query(`
    INSERT INTO assets (
      asset_type,
      asset_amount,
      name,
      symbol,
      price_api_id,
      icon_url
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    )
    RETURNING asset_id as assetId
  `,
  [
    // NOTE: This structure of inserting undefined on optional properties DOES work
    assetType,
    assetAmount,
    name,
    symbol,
    priceApiId,
    iconUrl
  ]);
  return res.rows[0];
};
