import * as accountAssets from '../models/accountAssetModel';
import { Router } from 'express';
import { AccountAsset } from '../types';
const router = Router();

// GET REQUESTS //

// Get account asset balances for authenticated user account
// Successful response data:
// accountAsset: {
//   account_assets_id
//   account_id
//   asset_id
//   asset_amount
// }
router.get('/account/asset', (req, res) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  accountAssets.getAccountAssetsByAssetId(req.user!.id, req.query.id as string)
    .then((result) => {
      let accountAsset = result.rows[0];
      res.status(200).send({accountAsset});
    })
    .catch((error: any) => res.status(404).send({ message: `Error retrieving account asset info for assetId ${req.query.id}` }));
});

// Get account asset balances for authenticated user account
// Successful response data:
// accountAssets: [accountAsset]
router.get('/account/asset/list', (req, res) => {
  accountAssets.getAccountAssetsByAccountId(req.user!.id)
    .then((result) => {
      let accountAssets = result.rows;
      res.status(200).send({accountAssets});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving account asset info' }));
});

// POST REQUESTS //

// Create an asset supply (or deposit, if asset supply already exists in account)
// TODO: Change the order where depositing does not require a check if the supply exists already,
// instead does it the other way around, just create a record if it doesn't yet exist
router.post('/account/asset/supply', (req, res) => {
  if (!req.body.id || !req.body.amount) {
    return res.status(400).send({ message: 'Missing query parameters' });
  }
  let accountAsset: AccountAsset = {
    accountId: req.user!.id,
    assetId: req.body.id,
    assetAmount: req.body.amount
  }
  accountAssets.createAccountAssetsForAssetId(accountAsset)
    .then((result) => res.status(201).send({ message: 'Asset supply deposited' }))
    .catch((error: any) => {
      console.log('Error creating asset supply:', error);
      return res.status(400).send({ message: `Error creating asset supply for assetId ${req.body.assetId}` });
    });
});

export default router;
