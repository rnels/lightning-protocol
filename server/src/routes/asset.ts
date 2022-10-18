import * as assets from '../models/assetModel';
import { Router } from 'express';
const router = Router();

// GET REQUESTS //

// Get asset info by asset ID
// Expects in req.query:
//  id - asset_id to retrieve details of
// Successful response data:
// asset: {
//   asset_id
// }
router.get('/asset', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  assets.getAssetById(req.query.id as string)
    .then((result) => {
      let asset = result.rows[0];
      res.status(200).send({asset});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving asset info' }));
});

// Successful response data:
// assets: [asset]
router.get('/asset/list', (req, res, next) => {
  assets.getAllAssets()
    .then((result) => {
      let assets = result.rows;
      res.status(200).send({assets});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving asset list' }));
});

export default router;
