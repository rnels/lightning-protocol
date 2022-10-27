import * as assets from '../models/assetModel';
import { Router } from 'express';
import { Asset } from '../types';
const router = Router();

// GET REQUESTS //

// Get asset info by asset ID
// Expects in req.query:
//  id - asset_id to retrieve details of
// Successful response data:
// asset: {
//   assetId,
//   assetType,
//   assetAmount,
//   name,
//   symbol,
//   priceFeedUrl,
//   iconUrl
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

// Get asset price by asset ID
// Expects in req.query:
//  id - asset_id to retrieve price of
// Successful response data:
// asset: {
//   assetId (Integer)
//   price (Decimal)
// }
router.get('/asset/price', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  assets.getAssetPriceById(req.query.id as string)
    .then((asset) => {
      res.status(200).send({asset});
    })
    .catch((error: any) => {
      console.log('Error retreiving asset price:', error);
      res.status(404).send({ message: 'Error retrieving asset price' });
    });
});

// TODO: Create routes to add assets
// TODO: Make this admin-only
// Expects in req.body:
//  assetType (String) - Must be one of 'crypto', 'stock', 'currency'
//  assetAmount (Decimal) - Amount of asset to use for contracts
//  name (String) - Name of the financial asset
//  symbol (String) - Symbol or ticker of the financial asset
//  priceApiId (Integer) - Id to use for retrieving price information from API
router.post('/asset', (req, res, next) => {
  if (!req.body.assetType || !req.body.assetType || !req.body.name || !req.body.symbol || !req.body.priceApiId) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  assets.createAsset(req.body.assetType, req.body.assetAmount, req.body.name, req.body.symbol, req.body.priceApiId)
    .then(() => {
      res.status(201).send({message: 'Asset created'});
    })
    .catch((error: any) => res.status(400).send({ message: 'Error creating asset' }));
});

export default router;
