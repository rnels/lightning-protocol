import * as groups from '../../models/groupModel';
import { Router } from 'express';
const router = Router();

// This is where you go to get cascading information

// GET REQUESTS //

// Get nested info at the provided level
// Successful response data:
// Includes contractTypes, pools
router.get('/user/group/asset/owned', (req, res, next) => {
  groups.getAssetGroupOwned(req.user!.id)
    .then((assets) => {
      res.status(200).send({assets});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving info' }));
});

// Get nested info at the provided level
// Successful response data:
// Includes contractTypes, pools
router.get('/user/group/asset/id/owned', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  groups.getAssetGroupOwnedById(req.query.assetId as string, req.user!.id)
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
router.get('/user/group/pool/owned', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  groups.getPoolGroupOwned(req.query.assetId as string, req.user!.id)
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
router.get('/user/group/contract/type/owned', (req, res, next) => {
  if (!req.query.assetId) {
    return res.status(400).send({ message: 'Missing query parameter: assetId' });
  }
  groups.getContractTypeGroupOwned(req.query.assetId as string, req.user!.id)
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
router.get('/user/group/contract/owned', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  groups.getContractGroupOwned(req.query.typeId as string, req.user!.id)
    .then((contracts) => {
      res.status(200).send({contracts});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving info' }));
});

export default router;
