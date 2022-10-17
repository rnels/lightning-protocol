import * as pools from '../models/poolModel';
import * as accountTokens from '../models/accountTokenModel';
import { Router } from 'express';
import { Pool, AccountToken } from '../types';
import pool from '../db/db';
const router = Router();

// GET REQUESTS //

// Get pool info by pool ID
// Expects in req.query:
//  id - pool_id to retrieve details of
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
//  id - token_id to retrieve pools for
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

// Create a new pool for a given tokenId
// Expects in req.body:
//  tokenId (Integer) - token_id to create a pool for
router.post('/pool', (req, res, next) => {
  if (!req.body.tokenId || typeof req.body.tokenId !== 'number') {
    return res.status(400).send({ message: 'Invalid or missing body parameter: tokenId' });
  }
  let pool: Pool = {
    accountId: req.user!.id,
    tokenId: req.body.tokenId,
    tokenAmount: 0,
    locked: false
  };
  pools.createPool(pool)
    .then((result) => res.status(201).send({ message: 'Pool created' }))
    .catch((error: any) => {
      console.log('Error creating pool:', error);
      return res.status(400).send({ message: 'Error creating pool' });
    });
  // accountTokens.getAccountTokensByTokenId(req.user!.id, req.body.tokenId)
  //   .then((result) => {
  //     // TODO: May not have to validate all this now that I have in schema check token_amount >= 0, but will keep for now
  //     let tokenAmount = result.rows[0].token_amount || 0;
  //     if (!tokenAmount || parseFloat(tokenAmount as string) < req.body.tokenAmount) {
  //       return res.status(400).send({ message: 'Not enough tokens for pool' });
  //     }
  //     return Promise.all([
  //       pools.createPool(pool),
  //       accountTokens.updateAccountTokenBalance({ // Subtract tokens from balance
  //         accountId: req.user!.id,
  //         tokenId: req.body.tokenId,
  //         tokenAmount: parseFloat(tokenAmount as string) - req.body.tokenAmount
  //       })
  //     ])
  //       .then((result) => res.status(201).send({ message: 'Pool created' }))
  //       .catch((error: any) => {
  //         console.log('Error creating pool:', error);
  //         return res.status(400).send({ message: 'Error creating pool' });
  //       });
  //   })
  //   .catch((error: any) => res.status(400).send({ message: 'Error getting account tokens' }));
});

// Despoit an amount of tokens to a pool
// Expects in req.body:
//  poolId (Integer) - pool_id to deposit into
//  tokenAmount (Decimal) - Amount to deposit to pool
// TODO: Validate correct types in body
router.post('/pool/deposit', (req, res, next) => {
  if (!req.body.poolId || !req.body.tokenAmount) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  pools.depositPoolTokens(req.body.poolId, req.body.tokenAmount, req.user!.id)
    .then((result) => {
      res.status(204).send({ message: 'Tokens successfully deposited to pool and withdrawn from balance' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error depositing tokens to pool' }));
});

// Withdraw an amount of tokens from a pool
// Expects in req.body:
//  poolId (Integer) - pool_id to withdraw from
//  tokenAmount (Decimal) - Amount to withdraw from pool
// TODO: Validate correct types in body
router.post('/pool/withdraw', (req, res, next) => {
  if (!req.body.poolId || !req.body.tokenAmount) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  pools.withdrawPoolTokens(req.body.poolId, req.body.tokenAmount, req.user!.id)
    .then((result) => {
      res.status(204).send({ message: 'Tokens successfully withdrawn from pool and deposited to balance' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error withdrawing tokens from pool' }));
});

export default router;
