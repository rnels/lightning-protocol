import * as contracts from '../models/contractModel';
import * as contractTypes from '../models/contractTypeModel';
import { Router } from 'express';
import { Contract } from '../types';
const router = Router();

// GET REQUESTS //

// Get contract info by contract ID
// Expects in req.query:
//  id - Contract ID to retrieve details of
// Successful response data:
// contract: {
//   contract_id
//   type_id
//   owner_id
//   pool_id
//   ask_price
//   created_at
// }
router.get('/contract', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  contracts.getContractById(req.query.id as string)
    .then((result) => {
      let contract = result.rows[0];
      res.status(200).send({contract});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract info' }));
});

// Get contract type info by contract type ID
// Expects in req.query:
//  id - Contract type ID to retrieve details of
// Successful response data:
// contractType: {
//   contract_type_id
//   listing_id
//   direction
//   strike_price
//   expires_at
// }
router.get('/contract/type', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  contractTypes.getContractTypeById(req.query.id as string)
    .then((result) => {
      let contractType = result.rows[0];
      res.status(200).send({contractType});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract type info' }));
});

// Retrieve contracts for a given contract type ID
// Expects in req.query:
//  id - Listing ID to retrieve contract types of
// Successful response data:
// contracts: [contract]
router.get('/contract/list', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  contracts.getContractsByTypeId(req.query.id as string)
    .then((result) => {
      let contracts = result.rows;
      res.status(200).send({contracts});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract list' }));
});

// Retrieve contracts for the authenticated user account
// Successful response data:
// contracts: [contract]
router.get('/contract/owned', (req, res, next) => {
  contracts.getContractsByOwnerId(req.user!.id)
    .then((result) => {
      let contracts = result.rows;
      res.status(200).send({contracts});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract list' }));
});

// Retrieve contract types for a given listing ID
// Expects in req.query:
//  id - Listing to retrieve contract types of
// Successful response data:
// contractTypes: [contractType]
router.get('/contract/type/list', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  contractTypes.getContractTypesByListingId(req.query.id as string)
    .then((result) => {
      let contractTypes = result.rows;
      res.status(200).send({contractTypes});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract type list' }));
});

// POST REQUESTS //

// Create a contract
// Expects in req.body:
//  typeId - Integer
//  poolId - Integer
// TODO: Validate correct types in body
router.post('/contract', (req, res, next) => {
  if (!req.body.typeId || !req.body.poolId) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  let contract: Contract = {
    typeId: req.body.typeId,
    ownerId: req.user!.id,
    poolId: req.body.poolId
  };
  contracts.createContract(contract)
    .then((result) => {
      res.status(201).send({ message: 'Contract created' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error creating contract' }));
});

// PUT/PATCH REQUESTS //

// Update a contract ask price
// Expects in req.body:
//  contractId - Integer
//  askPrice - Decimal
// TODO: Validate correct types in body
router.put('/contract', (req, res, next) => {
  if (!req.body.contractId || !req.body.askPrice) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  contracts.updateAskPrice(req.body.contractId, req.body.askPrice, req.user!.id)
    .then((result) => {
      res.status(204).send({ message: 'Ask price updated' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error updating contract ask price' }));
});

export default router;