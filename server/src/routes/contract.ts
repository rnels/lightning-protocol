import * as contracts from '../models/contractModel';
import * as contractTypes from '../models/contractTypeModel';
import { Router } from 'express';
import { Contract, ContractType } from '../types';
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
//   created_at
//   exercised
// }
router.get('/contract', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  contracts.getContractById(req.query.id as string)
    .then((contract) => {
      res.status(200).send({contract});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract info' }));
});

// Get contract type info by contract type ID
// Expects in req.query:
//  typeId - Contract type ID to retrieve details of
// Successful response data:
// contractType: {
//   contract_type_id
//   asset_id
//   asset_amount
//   direction
//   strike_price
//   expires_at
// }
router.get('/contract/type', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  contractTypes.getContractTypeById(req.query.typeId as string)
    .then((contractType) => {
      res.status(200).send({contractType});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract type info' }));
});

// Retrieve contracts for a given contract type ID
// Expects in req.query:
//  typeId - ID to retrieve contract types of
// Successful response data:
// contracts: [contract]
router.get('/contract/list', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  contracts.getContractsByTypeId(req.query.typeId as string)
    .then((contracts) => {
      res.status(200).send({contracts});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract list' }));
});

// Retrieve contracts for the authenticated user account
// Successful response data:
// contracts: [contract]
router.get('/contract/owned', (req, res, next) => {
  contracts.getContractsByOwnerId(req.user!.id)
    .then((contracts) => {
      res.status(200).send({contracts});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract list' }));
});

// Retrieve contract types for a given asset ID
// Expects in req.query:
//  assetId - Asset to retrieve contract types of
// Successful response data:
// contractTypes: [contractType]
router.get('/contract/type/list', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  contractTypes.getActiveContractTypesByAssetId(req.query.assetId as string)
    .then((contractTypes) => {
      res.status(200).send({contractTypes});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract type list' }));
});

// POST REQUESTS //

// Create a contract
// Expects in req.body:
//  typeId (Integer) - Contract type to instantiate for contract
//  askPrice (Decimal) [Optional - Defaults to null] - Starting price
// TODO: Restrict this, only should be called by app not by users
router.post('/contract', (req, res, next) => {
  if (!req.body.typeId) {
    return res.status(400).send({ message: 'Missing body parameter: typeId' });
  }
  let contract: Contract = {
    typeId: req.body.typeId,
    askPrice: req.body.askPrice,
    ownerId: req.user!.id, // DEBUG ONLY TODO: DELETE THIS
    exercised: false
  };
  contracts.createContract(contract)
    .then(() => {
      res.status(201).send({ message: 'Contract created' });
    })
    .catch((error: any) => {
      console.log('There was an error creating the contract:', error);
      res.status(400).send({ message: 'Error creating contract' });
    });
});

// Create a contract type
// Expects in req.body:
//   assetId (Integer)
//   assetAmount (Decimal)
//   direction (Boolean)
//   strikePrice (Decimal)
//   expiresAt (Integer) // TODO: Still need to revisit using date / time types
// TODO: Restrict this, only should be called by app not by users
router.post('/contract/type', (req, res, next) => {
  if (!req.body.assetId || !req.body.assetAmount || !req.body.direction || !req.body.strikePrice || !req.body.expiresAt) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  let contractType: ContractType = {
    assetId: req.body.assetId,
    assetAmount: req.body.assetAmount,
    direction: req.body.direction,
    strikePrice: req.body.strikePrice,
    expiresAt: req.body.expiresAt
  };
  contractTypes.createContractType(contractType)
    .then(({contractTypeId}) => {
      res.status(201).send({ message: 'Contract type created' });
    })
    .catch((error: any) => {
      console.log('There was an error creating the contract type:', error);
      res.status(400).send({ message: 'Error creating contract type' });
    });
});

// Exercises a contract type
// Expects in req.body:
//   contractId (Integer)
router.post('/contract/exercise', (req, res, next) => {
  if (!req.body.contractId) {
    return res.status(400).send({ message: 'Missing body parameter: contractId' });
  }
  contracts.exerciseContract(req.body.contractId, req.user!.id)
    .then(() => {
      res.status(201).send({ message: 'Contract exercised' });
    })
    .catch((error: any) => {
      console.log('There was an error exercises the contract:', error);
      res.status(400).send({ message: 'Error exercising the contract' });
    });
});

// PUT/PATCH REQUESTS //

// Update a contract ask price
// Expects in req.body:
//  contractId - Integer
//  askPrice - Decimal
router.put('/contract/ask', (req, res, next) => {
  if (!req.body.contractId || !req.body.askPrice) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  contracts.updateAskPrice(req.body.contractId, req.body.askPrice, req.user!.id)
    .then((result) => {
      res.status(201).send({ message: 'Ask price updated' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error updating contract ask price' }));
});

export default router;
