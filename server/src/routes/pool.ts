import * as pools from '../models/poolModel';
import { Pool } from '../types';
import { Router } from 'express';
const router = Router();

// GET REQUESTS //

// Get pool info by pool ID
// Expects in req.query:
//  id - pool_id to retrieve details of
// Successful response data:
// pool: {
//   pool_id
//   account_id
//   asset_id
//   asset_amount
//   locked
// }
router.get('/pool', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  pools.getPoolById(req.query.id as string)
    .then((result) => {
      let pool = result.rows[0];
      res.status(200).send({pool});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving pool info' }));
});

// Retrieve pools for a given asset ID
// Expects in req.query:
//  id - asset_id to retrieve pools for
// Successful response data:
// pools: [pool]
router.get('/pool/list', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  pools.getPoolsByAssetId(req.query.id as string)
    .then((result) => {
      let pools = result.rows;
      res.status(200).send({pools});
    })
    .catch((error: any) => res.status(404).send({ message: `Error retrieving pool list for asset ID ${req.query.id}` }));
});

// Retrieve pools for the authenticated user account
// Successful response data:
// pools: [pool]
router.get('/pool/owned', (req, res, next) => {
  pools.getPoolsByAccountId(req.user!.id)
    .then((result) => {
      let pools = result.rows;
      res.status(200).send({pools});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving pool list' }));
});

// POST REQUESTS //

// Create a new pool for a given assetId
// Expects in req.body:
//  assetId (Integer) - asset_id to create a pool for
router.post('/pool', (req, res, next) => {
  if (!req.body.assetId || typeof req.body.assetId !== 'number') {
    return res.status(400).send({ message: 'Invalid or missing body parameter: assetId' });
  }
  let pool: Pool = {
    accountId: req.user!.id,
    assetId: req.body.assetId,
    assetAmount: 0,
    locked: false
  };
  pools.createPool(pool)
    .then((result) => res.status(201).send({ message: 'Pool created' }))
    .catch((error: any) => {
      console.log('Error creating pool:', error);
      return res.status(400).send({ message: 'Error creating pool' });
    });
  // accountAssets.getAccountAssetsByAssetId(req.user!.id, req.body.assetId)
  //   .then((result) => {
  //     // TODO: May not have to validate all this now that I have in schema check asset_amount >= 0, but will keep for now
  //     let assetAmount = result.rows[0].asset_amount || 0;
  //     if (!assetAmount || parseFloat(assetAmount as string) < req.body.assetAmount) {
  //       return res.status(400).send({ message: 'Not enough assets for pool' });
  //     }
  //     return Promise.all([
  //       pools.createPool(pool),
  //       accountAssets.updateAccountAssetBalance({ // Subtract assets from balance
  //         accountId: req.user!.id,
  //         assetId: req.body.assetId,
  //         assetAmount: parseFloat(assetAmount as string) - req.body.assetAmount
  //       })
  //     ])
  //       .then((result) => res.status(201).send({ message: 'Pool created' }))
  //       .catch((error: any) => {
  //         console.log('Error creating pool:', error);
  //         return res.status(400).send({ message: 'Error creating pool' });
  //       });
  //   })
  //   .catch((error: any) => res.status(400).send({ message: 'Error getting account assets' }));
});

// Despoit an amount of assets to a pool
// Expects in req.body:
//  poolId (Integer) - pool_id to deposit into
//  assetAmount (Decimal) - Amount to deposit to pool
// TODO: Validate correct types in body
router.post('/pool/deposit', (req, res, next) => {
  if (!req.body.poolId || !req.body.assetAmount) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  pools.depositPoolAssets(req.body.poolId, req.body.assetAmount, req.user!.id)
    .then((result) => {
      res.status(204).send({ message: 'Assets successfully deposited to pool and withdrawn from balance' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error depositing assets to pool' }));
});

// Withdraw an amount of assets from a pool
// Expects in req.body:
//  poolId (Integer) - pool_id to withdraw from
//  assetAmount (Decimal) - Amount to withdraw from pool
// TODO: Validate correct types in body
router.post('/pool/withdraw', (req, res, next) => {
  if (!req.body.poolId || !req.body.assetAmount) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  pools.withdrawPoolAssets(req.body.poolId, req.body.assetAmount, req.user!.id)
    .then((result) => {
      res.status(204).send({ message: 'Assets successfully withdrawn from pool and deposited to balance' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error withdrawing assets from pool' }));
});

export default router;
