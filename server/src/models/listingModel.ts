import db from '../db/db';
import { Listing } from '../types';

export function getAllListings(sort='listing_id ASC', count=10) {
  return db.query(`
    SELECT *
      FROM listings
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
};

export function getListingById(id: number) {
  return db.query(`
    SELECT *
      FROM listings
      WHERE listing_id=$1
  `, [id]);
};

export function getListingsByAssetType(assetType: string) {
  return db.query(`
    SELECT *
      FROM listings
      WHERE asset_type=$1
  `, [assetType]);
};

export function createListing(listing: Listing) {
  return db.query(`
    INSERT INTO listings (
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
    RETURNING listing_id
  `,
  [
    // NOTE: This structure of inserting undefined on optional properties DOES work
    listing.assetType,
    listing.name,
    listing.symbol,
    listing.priceFeedUrl,
    listing.iconUrl
  ]);
};
