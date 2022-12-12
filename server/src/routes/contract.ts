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
//   contractId
//   typeId
//   createdAt
//   exercised
//   exercisedAmount
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
router.get('/contract/ext', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  contracts.getContractOwnedByIdExt(req.query.id as string, req.user!.id)
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
//   contractTypeId
//   assetId
//   direction
//   strikePrice
//   expiresAt
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

// Get badged contract types by assetId and direction
// Expects in req.query:
//  assetId - Asset ID to retrieve contractTypes of
//  direction - Call or put direction for contractTypes ('true' or 'false')
// Successful response data:
// contractTypes: ContractType[] (+ badge)
router.get('/contract/type/badged', (req, res, next) => {
  if (!req.query.assetId || !req.query.direction) {
    return res.status(400).send({ message: 'Missing query parameter(s)' });
  }
  let direction: boolean;
  if ((req.query.direction as string).toLowerCase() === 'true') direction = true;
  else direction = false;
  contractTypes.getBadgedTypesForAssetAndDirection(req.query.assetId as string, direction)
    .then((contractTypes) => {
      res.status(200).send({contractTypes});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract types' }));
});

// Retrieve active contracts for a given contract type ID
// Expects in req.query:
//  typeId - ID to retrieve contracts of
// Successful response data:
// contracts: Contract[]
router.get('/contract/list', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  contracts.getActiveContractsByTypeId(req.query.typeId as string)
    .then((contracts) => {
      res.status(200).send({contracts});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract list' }));
});

// Retrieve contracts for the authenticated user account
// Successful response data:
// contracts: Contract[]
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
// contractTypes: ContractType[]
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

// Retrieve ask prices for a given contract typeId
// Expects in req.query:
//  typeId - Contract type to retrieve asks for
// Successful response data:
// asks: number[]
router.get('/contract/type/asks', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  contractTypes.getAskPricesByTypeId(req.query.typeId as string)
    .then((asks) => {
      res.status(200).send({asks});
    })
    .catch((error: any) => {
      res.status(404).send({ message: 'Error retrieving contract type asks' });
      console.log(error);
    });
});

// POST REQUESTS //

// Exercises a contract
// Expects in req.body:
//   contractId (Integer)
// TODO: Respond with detailed error message
router.post('/contract/exercise', (req, res, next) => {
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
router.put('/contract/ask', (req, res, next) => {
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
router.delete('/contract/ask', (req, res, next) => {
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
