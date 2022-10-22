import db from '../db/db';
import { getAssetPrice } from '../prices/getPrices';
import { Asset } from '../types';

export async function getAllAssets(sort='asset_id ASC'): Promise<Asset[]> {
  const res = await db.query(`
    SELECT
      asset_id as "assetId",
      asset_type as "assetType",
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
      name,
      symbol,
      price_api_id as "priceApiId",
      icon_url as "iconUrl"
    FROM assets
      WHERE asset_type=$1
  `, [assetType]);
  return res.rows;
};

export async function createAsset(asset: Asset): Promise<{assetId: number}> {
  const res = await db.query(`
    INSERT INTO assets (
      asset_type,
      name,
      symbol,
      price_api_id,
      icon_url
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING asset_id as assetId
  `,
  [
    // NOTE: This structure of inserting undefined on optional properties DOES work
    asset.assetType,
    asset.name,
    asset.symbol,
    asset.priceApiId,
    asset.iconUrl
  ]);
  return res.rows[0];
};
