import * as assets from '../models/assetModel';
import { Router } from 'express';
const router = Router();

// GET REQUESTS //

// Get asset info by asset ID
// Expects in req.query:
//  id - asset_id to retrieve details of
// Successful response data:
// asset: {
//   assetId,
//   assetType,
//   name,
//   symbol,
//   priceFeedUrl,
//   icon_url
// }
router.get('/asset', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  assets.getAssetById(req.query.id as string)
    .then((asset) => {
      res.status(200).send({asset});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving asset info' }));
});

// Successful response data:
// assets: [asset]
router.get('/asset/list', (req, res, next) => {
  assets.getAllAssets()
    .then((assets) => {
      res.status(200).send({assets});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving asset list' }));
});

// TODO: Create routes to add assets

export default router;
