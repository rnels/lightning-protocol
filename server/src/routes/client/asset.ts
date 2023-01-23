import * as assets from '../../models/assetModel';
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
//   assetAmount,
//   name,
//   symbol,
//   priceFeedUrl,
//   lastPrice,
//   lastUpdated,
//   iconUrl
// }
router.get('/client/asset', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  assets.getAssetById(req.query.id as string)
    .then((asset) => {
      res.status(200).send({asset});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving asset info' }));
});

// Get asset price by asset ID
// Expects in req.query:
//  id - asset_id to retrieve price of
// Successful response data:
// price - number (decimal)
// TODO: Check that this doesn't get converted to string?
router.get('/client/asset/price', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  assets.getAssetPriceById(req.query.id as string)
    .then((price) => {
      res.status(200).send({price});
    })
    .catch((error: any) => {
      console.log('Error retreiving asset price:', error);
      res.status(404).send({ message: 'Error retrieving asset price' });
    });
});

// Get asset info by asset ID
// Expects in req.query:
//  id - asset_id to retrieve details of
//  days - number of days for which to retrieve history from
// Successful response data:
// prices[]:
//  {
//    price: string | number
//    dataPeriod: string
//  }[]
router.get('/client/asset/price/history', (req, res, next) => {
  if (!req.query.id || !req.query.days) {
    return res.status(400).send({ message: 'Missing query parameter(s)' });
  }
  assets.getAssetPriceHistoryByAssetIdLimit(req.query.id as string, req.query.days as string)
    .then((prices) => {
      res.status(200).send({prices});
    })
    .catch((error: any) => {
      console.log('Error retreiving asset price history:', error);
      res.status(404).send({ message: 'Error retrieving asset price history' });
    });
});

// Successful response data:
// assets: Asset[]
router.get('/client/asset/list', (req, res, next) => {
  assets.getAllAssets()
    .then((assets) => {
      res.status(200).send({assets});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving asset list' }));
});

// POST REQUESTS //

// TODO: Make this admin-only
// Expects in req.body:
//  assetType (String) - Must be one of 'crypto', 'stock', 'currency'
//  assetAmount (Decimal) - Amount of asset to use for contracts
//  name (String) - Name of the financial asset
//  symbol (String) - Symbol or ticker of the financial asset
//  priceApiId (Integer) - Id to use for retrieving price information from API
router.post('/client/asset', (req, res, next) => {
  if (!req.body.assetType || !req.body.assetAmount || !req.body.name || !req.body.symbol || !req.body.priceApiId) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  assets.createAsset(req.body.assetType, req.body.assetAmount, req.body.name, req.body.symbol, req.body.priceApiId)
    .then(() => {
      res.status(201).send({ message: 'Asset created' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error creating asset' }));
});

export default router;
