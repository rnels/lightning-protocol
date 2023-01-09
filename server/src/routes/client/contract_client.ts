import * as contracts from '../../models/contractModel';
import * as contractTypes from '../../models/contractTypeModel';
import { Router } from 'express';
import { Contract, ContractType } from '../../types';
const router = Router();

// GET REQUESTS //

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
router.get('/client/contract/type', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  contractTypes.getContractTypeById(req.query.typeId as string)
    .then((contractType) => {
      res.status(200).send({contractType});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving contract type info' }));
});

// Get top badged contract types by assetId and direction
// Expects in req.query:
//  assetId - Asset ID to retrieve contractTypes of
//  direction - Call or put direction for contractTypes ('true' or 'false')
// Successful response data:
// contractTypes: ContractType[] (+ badge)
router.get('/client/contract/type/badged/top', (req, res, next) => {
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
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving top badged contract types' }));
});

// Get "featured" contract types by assetId and direction
// Expects in req.query:
//  assetId - Asset ID to retrieve contractTypes of
//  direction - Call or put direction for contractTypes ('true' or 'false')
// Successful response data:
// contractTypes: ContractType[] (+ badge)
router.get('/client/contract/type/featured', (req, res, next) => {
  if (!req.query.assetId || !req.query.direction) {
    return res.status(400).send({ message: 'Missing query parameter(s)' });
  }
  let direction: boolean;
  if ((req.query.direction as string).toLowerCase() === 'true') direction = true;
  else direction = false;
  contractTypes.getFeaturedContractTypes(req.query.assetId as string, direction)
    .then((contractTypes) => {
      res.status(200).send({contractTypes});
    })
    .catch((error: any) => {
      console.log('Error retrieving featured contract types', error);
      res.status(404).send({ message: 'Error retrieving featured contract types' });
    });
});

// Retrieve active contracts for a given contract type ID
// Expects in req.query:
//  typeId - ID to retrieve contracts of
// Successful response data:
// contracts: Contract[]
router.get('/client/contract/list', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  contracts.getActiveContractsByTypeId(req.query.typeId as string)
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
router.get('/client/contract/type/list', (req, res, next) => {
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
router.get('/client/contract/type/asks', (req, res, next) => {
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

export default router;
