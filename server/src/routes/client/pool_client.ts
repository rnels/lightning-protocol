import * as pools from '../../models/poolModel';
import { Pool } from '../../types';
import { Router } from 'express';
const router = Router();

// GET REQUESTS //

// Get pool info (and pool locks) by pool ID
// Expects in req.query:
//  id - pool_id to retrieve details of
// Successful response data:
// pool: {
//   poolId
//   accountId
//   assetId
//   assetAmount
//   tradeFees
//   poolLocks: poolLock[]
// }
router.get('/client/pool', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  pools.getPoolById(req.query.id as string)
    .then((pool) => {
      res.status(200).send({pool});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving pool info' }));
});

// Retrieve pools for a given asset ID
// Expects in req.query:
//  assetId - asset_id to retrieve pools for
// Successful response data:
// pools: Pool[]
router.get('/client/pool/list', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  pools.getPoolsByAssetId(req.query.assetId as string)
    .then((pools) => {
      res.status(200).send({pools});
    })
    .catch((error: any) => res.status(404).send({ message: `Error retrieving pool list for asset ID ${req.query.assetId}` }));
});

// Retrieve pooled asset amount for a given asset ID
// Expects in req.query:
//  assetId - asset_id to retrieve pools for
// Successful response data:
// assetAmount (Decimal)
router.get('/client/pool/asset', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  pools.getPoolAssetsByAssetId(req.query.assetId as string)
    .then((assetAmount) => {
      res.status(200).send({assetAmount});
    })
    .catch((error: any) => res.status(404).send({ message: `Error retrieving pool assets for asset ID ${req.query.assetId}` }));
});

// Retrieve pools locks for the provided poolId
// Successful response data:
// poolLocks: PoolLock[]
router.get('/client/pool/lock', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  pools.getPoolLocksByPoolId(req.query.id as string)
    .then((poolLocks) => {
      res.status(200).send({poolLocks});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving pool lock list' }));
});

// Retrieve locked pool asset amount for a given asset ID
// Expects in req.query:
//  assetId - asset_id to retrieve pool locks for
// Successful response data:
// assetAmount (Decimal)
router.get('/client/pool/lock/asset', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  pools.getPoolLockAssetsByAssetId(req.query.assetId as string)
    .then((assetAmount) => {
      res.status(200).send({assetAmount});
    })
    .catch((error: any) => res.status(404).send({ message: `Error retrieving pool assets for asset ID ${req.query.assetId}` }));
});

export default router;
