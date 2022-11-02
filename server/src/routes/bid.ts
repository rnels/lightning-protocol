import * as bids from '../models/bidModel';
import { Router } from 'express';
import { Bid } from '../types';
const router = Router();

// GET REQUESTS //

// Get bid info by bid ID
// Expects in req.query:
//  id - Bid ID to retrieve details of
// Successful response data:
// bid: {
//   bidId
//   typeId
//   accountId
//   bidPrice
// }
router.get('/bid', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  bids.getBidById(req.query.id as string)
    .then((bid) => {
      res.status(200).send({bid});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving bid info' }));
});

// Retrieve bids for a given contract type ID
// Expects in req.query:
//  typeId - Contract type ID to retrieve bids of
// Successful response data:
// bids: Bid[]
router.get('/bid/type', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  bids.getBidsByContractTypeId(req.query.typeId as string)
    .then((bids) => {
      res.status(200).send({bids});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving bid list' }));
});

// Retrieve bids for the authenticated user account
// Successful response data:
// bids: Bid[]
router.get('/bid/owned', (req, res, next) => {
  bids.getBidsByAccountId(req.user!.id)
    .then((bids) => {
      res.status(200).send({bids});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving bid list' }));
});

// POST REQUESTS //

// Create a bid for a contract type
// Expects in req.body:
//  typeId (Integer)
//  bidPrice (Decimal)
router.post('/bid', (req, res, next) => {
  if (!req.body.typeId || !req.body.bidPrice) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  bids.createBid(req.body.typeId, req.user!.id, req.body.bidPrice)
    .then(() => {
      res.status(201).send({ message: 'Bid created' });
    })
    .catch((error: any) => {
      console.log('There was an error creating the bid:', error);
      res.status(400).send({ message: 'Error creating bid' });
    });
});

// PUT/PATCH REQUESTS //

// Update a bid price
// Expects in req.body:
//  bidId (Integer)
//  bidPrice (Decimal)
router.put('/bid/price', (req, res, next) => {
  if (!req.body.bidId || !req.body.bidPrice) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  bids.updateBidPrice(req.body.bidId, req.body.bidPrice, req.user!.id)
    .then(() => {
      res.status(201).send({ message: 'Bid price updated' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error updating bid price' }));
});

// DELETE REQUESTS //

// Remove a bid
// Expects in req.query:
//  bidId
router.delete('/bid', (req, res, next) => {
  if (!req.query.bidId) {
    return res.status(400).send({ message: 'Missing query parameter: bidId' });
  }
  bids.removeBid(req.query.bidId as string, req.user!.id)
    .then(() => {
      res.status(202).send({ message: 'Bid removed' });
    })
    .catch((error: any) => res.status(400).send({ message: 'Error removing bid' }));
});

export default router;
