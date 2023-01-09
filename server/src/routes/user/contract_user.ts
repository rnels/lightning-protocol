import * as contracts from '../../models/contractModel';
import * as contractTypes from '../../models/contractTypeModel';
import { Router } from 'express';
import { Contract, ContractType } from '../../types';
const router = Router();

// GET REQUESTS //

// Get extended contract info by contract ID (includes trades)
// Expects in req.query:
//  id - Contract ID to retrieve details of
// Successful response data:
// contract: {
//   contractId
//   typeId
//   createdAt
//   exercised
//   exercisedAmount
//   trades: Trade[]
// }
router.get('/user/contract/ext', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  contracts.getContractOwnedByIdExt(req.query.id as string, req.user!.id)
    .then((contract) => {
      res.status(200).send({contract});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract info' }));
});

// Retrieve contracts for the authenticated user account
// Successful response data:
// contracts: Contract[]
router.get('/user/contract/owned', (req, res, next) => {
  contracts.getContractsByOwnerId(req.user!.id)
    .then((contracts) => {
      res.status(200).send({contracts});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract list' }));
});

// POST REQUESTS //

// Exercises a contract
// Expects in req.body:
//   contractId (Integer)
// TODO: Respond with detailed error message
router.post('/user/contract/exercise', (req, res, next) => {
  if (!req.body.contractId) {
    return res.status(400).send({ message: 'Missing body parameter: contractId' });
  }
  contracts.exerciseContract(req.body.contractId, req.user!.id)
    .then(() => {
      res.status(201).send({ message: 'Contract exercised' });
    })
    .catch((error: any) => {
      console.log(error.message);
      res.status(400).send({ message: error.message });
    });
});

// PUT/PATCH REQUESTS //

// Update a contract ask price
// Expects in req.body:
//  contractId - Integer
//  askPrice - Decimal
// TODO: Respond with detailed error message
router.put('/user/contract/ask', (req, res, next) => {
  if (!req.body.contractId || !req.body.askPrice) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  contracts.updateAskPrice(req.body.contractId, req.body.askPrice, req.user!.id)
    .then(() => res.status(201).send({ message: 'Ask price updated' }))
    .catch((error: any) => res.status(400).send({ message: error.message }));
});

// DELETE REQUESTS //

// Remove a contract ask price
// Expects in req.query:
//  contractId
router.delete('/user/contract/ask', (req, res, next) => {
  if (!req.query.contractId) {
    return res.status(400).send({ message: 'Missing query parameter: contractId' });
  }
  contracts.removeAskPrice(req.query.contractId as string, req.user!.id)
    .then(() => {
      res.status(202).send({ message: 'Ask removed' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error removing ask price' }));
});

export default router;
