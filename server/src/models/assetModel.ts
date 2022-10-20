import db from '../db/db';
import { Asset } from '../types';

export function getAllAssets(sort='asset_id ASC') {
  return db.query(`
    SELECT *
      FROM assets
    ORDER BY $1
  `, [sort]);
};

export function getAssetById(id: string | number) {
  return db.query(`
    SELECT *
      FROM assets
      WHERE asset_id=$1
  `, [id]);
};

export function getAssetsByAssetType(assetType: string) {
  return db.query(`
    SELECT *
      FROM assets
      WHERE asset_type=$1
  `, [assetType]);
};

export function createAsset(asset: Asset) {
  return db.query(`
    INSERT INTO assets (
      asset_type,
      name,
      symbol,
      price_feed_url,
      icon_url
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING asset_id
  `,
  [
    // NOTE: This structure of inserting undefined on optional properties DOES work
    asset.assetType,
    asset.name,
    asset.symbol,
    asset.priceFeedUrl,
    asset.iconUrl
  ]);
};
