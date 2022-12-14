import * as pools from '../models/poolModel';
import { Pool } from '../types';
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
// pools: Pool[]
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

// Retrieve pooled asset amount for a given asset ID
// Expects in req.query:
//  assetId - asset_id to retrieve pools for
// Successful response data:
// assetAmount (Decimal)
router.get('/pool/asset', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  pools.getPoolAssetsByAssetId(req.query.assetId as string)
    .then((assetAmount) => {
      res.status(200).send({assetAmount});
    })
    .catch((error: any) => res.status(404).send({ message: `Error retrieving pool assets for asset ID ${req.query.assetId}` }));
});

// Retrieve pools for the authenticated user account
// Successful response data:
// pools: Pool[]
router.get('/pool/owned', (req, res, next) => {
  pools.getPoolsByAccountId(req.user!.id)
    .then((pools) => {
      res.status(200).send({pools});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving pool list' }));
});

// Retrieve a pool for the authenticated user account matching the provided assetId
// Expects in req.query:
//  assetId - asset_id to retrieve pools for
// Successful response data:
// pool: {
//   poolId
//   accountId
//   assetId
//   assetAmount
//   tradeFees
// }
router.get('/pool/owned/asset', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  pools.getPoolByAccountAssetIds(req.user!.id, req.query.assetId as string)
    .then((pool) => {
      res.status(200).send({pool});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving pool' }));
});

// Retrieve pools locks for the provided poolId
// Successful response data:
// poolLocks: PoolLock[]
router.get('/pool/lock', (req, res, next) => {
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
router.get('/pool/lock/asset', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  pools.getPoolLockAssetsByAssetId(req.query.assetId as string)
    .then((assetAmount) => {
      res.status(200).send({assetAmount});
    })
    .catch((error: any) => res.status(404).send({ message: `Error retrieving pool assets for asset ID ${req.query.assetId}` }));
});

// Retrieve pools locks for the authenticated user account
// Successful response data:
// poolLocks: PoolLock[]
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
  pools.createPool(
    req.user!.id,
    req.body.assetId,
    req.body.assetAmount || 0
  )
    .then(({poolId}) => res.status(201).send({ message: 'Pool created' }))
    .catch((error: any) => {
      console.log('Error creating pool:', error);
      return res.status(400).send({ message: 'Error creating pool' });
    });
});

// Purchases an amount of assets for a pool
// Expects in req.body:
//  poolId (Integer) - pool_id to deposit into
//  assetAmount (Decimal) - Amount to purchase into pool
router.post('/pool/asset/buy', (req, res, next) => {
  if (!req.body.poolId || !req.body.assetAmount) {
    return res.status(400).send({ message: 'Missing or invalid body parameters' });
  }
  pools.buyPoolAssets(req.body.poolId, Number(req.body.assetAmount), req.user!.id)
    .then(() => {
      res.status(201).send({ message: 'Assets successfully purchased' });
    })
    .catch((error: any) => {
      console.log('Error purchasing pool assets:', error);
      res.status(400).send({ message: 'Error purchasing pool assets' });
    });
});

// Sells an amount of assets from a pool
// Expects in req.body:
//  poolId (Integer) - pool_id to sell from
//  assetAmount (Decimal) - Amount to sell from pool
router.post('/pool/asset/sell', (req, res, next) => {
  if (!req.body.poolId || !req.body.assetAmount) {
    return res.status(400).send({ message: 'Missing or invalid body parameters' });
  }
  pools.sellPoolAssets(req.body.poolId, Number(req.body.assetAmount), req.user!.id)
    .then(() => {
      res.status(201).send({ message: 'Assets successfully sold from pool' });
    })
    .catch((error: any) => {
      console.log('Error selling pool assets:', error);
      res.status(400).send({ message: 'Error selling assets from pool' });
    });
});

// // Withdraw trade fees from all pool locks into account balance
// // Expects in req.body:
// //  poolId (Integer) - pool_id to withdraw from
// router.post('/pool/fees/withdraw', (req, res, next) => {
//   if (!req.body.poolId) {
//     return res.status(400).send({ message: 'Missing or invalid body parameter: poolId' });
//   }
//   pools.withdrawAllPoolLockFees(req.body.poolId, req.user!.id)
//     .then(() => {
//       res.status(201).send({ message: 'Fees successfully withdrawn from pool and deposited to account' });
//     })
//     .catch((error: any) => {
//       console.log('Error withdrawing pool fees:', error);
//       res.status(400).send({ message: 'Error withdrawing fees from pool' });
//     });
// });

// // Withdraw trade fees from specific pool lock into account balance
// // Expects in req.body:
// //  poolLockId (Integer) - pool_lock_id to withdraw from
// router.post('/pool/lock/fees/withdraw', (req, res, next) => {
//   if (!req.body.poolLockId) {
//     return res.status(400).send({ message: 'Missing or invalid body parameter: poolLockId' });
//   }
//   pools.withdrawPoolLockFees(req.body.poolLockId, req.user!.id)
//     .then(() => {
//       res.status(201).send({ message: 'Fees successfully withdrawn from pool lock and deposited to account' });
//     })
//     .catch((error: any) => {
//       console.log('Error withdrawing pool fees:', error);
//       res.status(400).send({ message: 'Error withdrawing fees from pool' });
//     });
// });

router.post('/pool/lock/assign', (req, res, next) => {
  if (!req.body.poolLockId) {
    return res.status(400).send({ message: 'Missing or invalid body parameter: poolLockId' });
  }
  pools.reassignPoolLock(req.body.poolLockId, req.user!.id)
    .then(() => {
      res.status(201).send({ message: 'Pool lock successfully reassigned' });
    })
    .catch((error: any) => {
      console.log('Error reassigning pool lock:', error);
      res.status(400).send({ message: 'Error reassigning pool lock' });
    });
});

export default router;
