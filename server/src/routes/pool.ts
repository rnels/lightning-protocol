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
//   poolId
//   accountId
//   assetId
//   assetAmount
//   tradeFees
// }
router.get('/pool', (req, res, next) => {
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
// pools: [pool]
router.get('/pool/list', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  pools.getPoolsByAssetId(req.query.assetId as string)
    .then((pools) => {
      res.status(200).send({pools});
    })
    .catch((error: any) => res.status(404).send({ message: `Error retrieving pool list for asset ID ${req.query.assetId}` }));
});

// Retrieve pools for the authenticated user account
// Successful response data:
// pools: [pool]
router.get('/pool/owned', (req, res, next) => {
  pools.getPoolsByAccountId(req.user!.id)
    .then((pools) => {
      res.status(200).send({pools});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving pool list' }));
});

// Retrieve pools locks for the authenticated user account
// Successful response data:
// poolLocks: [poolLocks]
router.get('/pool/owned/lock', (req, res, next) => {
  pools.getPoolLocksByAccountId(req.user!.id)
    .then((poolLocks) => {
      res.status(200).send({poolLocks});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving pool lock list' }));
});

// POST REQUESTS //

// Create a new pool for a given assetId
// Expects in req.body:
//  assetId (Integer) - asset_id to create a pool for
//  assetAmount (Decimal) [Optional - Defaults to 0] - Amount of asset to deposit
router.post('/pool', (req, res, next) => {
  if (!req.body.assetId || typeof req.body.assetId !== 'number') {
    return res.status(400).send({ message: 'Invalid or missing body parameter: assetId' });
  }
  let pool: Pool = {
    accountId: req.user!.id,
    assetId: req.body.assetId,
    assetAmount: req.body.assetAmount || 0
  };
  pools.createPool(pool)
    .then(({poolId}) => res.status(201).send({ message: 'Pool created' }))
    .catch((error: any) => {
      console.log('Error creating pool:', error);
      return res.status(400).send({ message: 'Error creating pool' });
    });
});

// Despoit an amount of assets to a pool
// Expects in req.body:
//  poolId (Integer) - pool_id to deposit into
//  assetAmount (Decimal) - Amount to deposit into pool
router.post('/pool/assets/deposit', (req, res, next) => {
  if (!req.body.poolId || !req.body.assetAmount) {
    return res.status(400).send({ message: 'Missing or invalid body parameters' });
  }
  pools.depositPoolAssets(req.body.poolId, req.body.assetAmount, req.user!.id)
    .then(() => {
      // TODO: Currently provides a success method even if nothing is updated,
      // in the case of a poolId passed that doesn't belong to the user
      // Probably change to a system of pool_transactions to get balances rather than updating a balance of the pool
      res.status(201).send({ message: 'Assets successfully deposited to pool' });
    })
    .catch((error: any) => {
      console.log('Error depositing pool assets:', error);
      res.status(400).send({ message: 'Error depositing assets to pool' });
    });
});

// Withdraw an amount of assets from a pool
// Expects in req.body:
//  poolId (Integer) - pool_id to withdraw from
//  assetAmount (Decimal) - Amount to withdraw from pool
router.post('/pool/assets/withdraw', (req, res, next) => {
  if (!req.body.poolId || !req.body.assetAmount) {
    return res.status(400).send({ message: 'Missing or invalid body parameters' });
  }
  pools.withdrawPoolAssets(req.body.poolId, req.body.assetAmount, req.user!.id)
    .then(({assetId}) => {
      // TODO: Currently provides a success method even if nothing is updated,
      // in the case of a poolId passed that doesn't belong to the user
      // Probably change to a system of pool_transactions to get balances rather than updating a balance of the pool
      res.status(201).send({ message: 'Assets successfully withdrawn from pool' });
    })
    .catch((error: any) => {
      console.log('Error withdrawing pool assets:', error);
      res.status(400).send({ message: 'Error withdrawing assets from pool' });
    });
});

// Withdraw an amount of fees from a pool into account balance
// Expects in req.body:
//  poolId (Integer) - pool_id to withdraw from
//  feeAmount (Decimal) - Amount to withdraw from pool
router.post('/pool/fees/withdraw', (req, res, next) => {
  if (!req.body.poolId || !req.body.feeAmount) {
    return res.status(400).send({ message: 'Missing or invalid body parameters' });
  }
  pools.withdrawPoolFees(req.body.poolId, req.body.feeAmount, req.user!.id)
    .then(() => {
      // TODO: Currently provides a success method even if nothing is updated,
      // in the case of a poolId passed that doesn't belong to the user
      // Probably change to a system of pool_transactions to get balances rather than updating a balance of the pool
      res.status(201).send({ message: 'Fees successfully withdrawn from pool and deposited to account' });
    })
    .catch((error: any) => {
      console.log('Error withdrawing pool fees:', error);
      res.status(400).send({ message: 'Error withdrawing fees from pool' });
    });
});

export default router;
