import * as groups from '../../models/groupModel';
import { Router } from 'express';
const router = Router();

// This is where you go to get cascading information

// GET REQUESTS //

// Get nested info at the provided level
// Successful response data:
// Includes contractTypes, pools
router.get('/client/group/asset', (req, res, next) => {
  groups.getAssetGroup()
    .then((assets) => {
      res.status(200).send({assets});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving info' }));
});

// Get nested info at the provided level
// Successful response data:
// Includes contractTypes, pools
router.get('/client/group/asset/id', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  groups.getAssetGroupById(req.query.assetId as string)
    .then((assets) => {
      res.status(200).send({assets});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving info' }));
});

// Get nested info at the provided level
// Expects in req.query:
//  assetId - assetId to retrieve pools (and nested) of
// Successful response data:
// Includes poolLocks
router.get('/client/group/pool', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  groups.getPoolGroup(req.query.assetId as string)
    .then((pools) => {
      res.status(200).send({pools});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving info' }));
});

// Get nested info at the provided level
// Expects in req.query:
//  assetId - assetId to retrieve contractTypes (and nested) of
// Successful response data:
// Includes contracts, bids
router.get('/client/group/contract/type', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  groups.getContractTypeGroup(req.query.assetId as string)
    .then((contractTypes) => {
      res.status(200).send({contractTypes});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving info' }));
});

// Get nested info at the provided level
// Expects in req.query:
//  typeId - typeId to retrieve contracts (and nested) of
// Successful response data:
// Includes trades
router.get('/client/group/contract', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  groups.getContractGroup(req.query.typeId as string)
    .then((contracts) => {
      res.status(200).send({contracts});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving info' }));
});

export default router;
