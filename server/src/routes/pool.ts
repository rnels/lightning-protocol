import * as pools from '../models/poolModel';
import { Router } from 'express';
import { Pool } from '../types';
const router = Router();

// GET REQUESTS //

// Get pool info by pool ID
// Expects in req.query:
//  id - Pool ID to retrieve details of
// Successful response data:
// pool: {
//   pool_id
//   account_id
//   token_id
//   token_amount
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

// Retrieve pools for a given token ID
// Expects in req.query:
//  id - Token ID to retrieve pools for
// Successful response data:
// pools: [pool]
router.get('/pool/list', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  pools.getPoolsByTokenId(req.query.id as string)
    .then((result) => {
      let pools = result.rows;
      res.status(200).send({pools});
    })
    .catch((error: any) => res.status(404).send({ message: `Error retrieving pool list for token ID ${req.query.id}` }));
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

// Create a pool
// Expects in req.body:
//  tokenId - Integer
//  tokenAmount - Decimal
// TODO: Validate correct types in body
router.post('/pool', (req, res, next) => {
  if (!req.body.tokenId || !req.body.tokenAmount) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  let pool: Pool = {
    accountId: req.user!.id,
    tokenId: req.body.tokenId,
    tokenAmount: req.body.tokenAmount,
    locked: false
  };
  pools.createPool(pool)
    .then((result) => {
      res.status(201).send({ message: 'Pool created' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error creating pool' }));
});

// PUT/PATCH REQUESTS //

// Update a pool token amount
// Expects in req.body:
//  poolId - Integer
//  tokenAmount - Decimal
// TODO: Validate correct types in body
router.put('/pool', (req, res, next) => {
  if (!req.body.poolId || !req.body.tokenAmount) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  pools.updateTokenAmount(req.body.poolId, req.body.tokenAmount, req.user!.id)
    .then((result) => {
      res.status(204).send({ message: 'Token amount updated' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error updating pool token amount' }));
});

export default router;
