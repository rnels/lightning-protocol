import db from '../db/db';
import { AccountAsset } from '../types';

// TODO: Write tests for this model

async function checkAccountAssetPairExists(accountId: string | number, assetId: string | number): Promise<boolean> {
  return (
    await getAccountAssetsByAssetId(accountId, assetId)
  ).rows.length > 0;
};

// Can be used to get all asset balances for an account
export function getAccountAssetsByAccountId(accountId: string | number) {
  return db.query(`
    SELECT
      asset_id,
      asset_amount
    FROM account_assets
      WHERE account_id=$1
  `, [accountId]);
};

// Can be used to get specific asset balance for an account
export function getAccountAssetsByAssetId(accountId: string | number, assetId: string | number) {
  return db.query(`
    SELECT
      asset_id,
      asset_amount
    FROM account_assets
      WHERE account_id=$1
        AND asset_id=$2
  `, [accountId, assetId]);
};

export async function createAccountAssetsForAssetId(accountAsset: AccountAsset) {
  let exists = await checkAccountAssetPairExists(accountAsset.accountId, accountAsset.assetId);
  if (exists) return depositAccountAssetBalance(accountAsset);
  return db.query(`
    INSERT INTO account_assets (
      account_id,
      asset_id,
      asset_amount
    ) VALUES ($1, $2, $3)
  `,
  [
    accountAsset.accountId,
    accountAsset.assetId,
    accountAsset.assetAmount
  ]);
};

// export function updateAccountAssetBalance(accountAsset: AccountAsset) {
//   return db.query(`
//     UPDATE account_assets
//     SET asset_amount=$3
//       WHERE account_id=$1
//       AND asset_id=$2
//   `,
//   [
//     accountAsset.accountId,
//     accountAsset.assetId,
//     accountAsset.assetAmount
//   ]);
// };

export function depositAccountAssetBalance(accountAsset: AccountAsset) {
  return db.query(`
    UPDATE account_assets
    SET asset_amount=asset_amount+$3
      WHERE account_id=$1
        AND asset_id=$2
  `,
  [
    accountAsset.accountId,
    accountAsset.assetId,
    accountAsset.assetAmount
  ]);
};

export function withdrawAccountAssetBalance(accountAsset: AccountAsset) {
  return db.query(`
    UPDATE account_assets
    SET asset_amount=asset_amount-$3
      WHERE account_id=$1
        AND asset_id=$2
  `,
  [
    accountAsset.accountId,
    accountAsset.assetId,
    accountAsset.assetAmount
  ]);
};
