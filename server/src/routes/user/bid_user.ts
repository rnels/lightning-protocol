import * as bids from '../../models/bidModel';
import { Router } from 'express';
import { Bid } from '../../types';
const router = Router();

// GET REQUESTS //

// Retrieve bids for the authenticated user account
// Successful response data:
// bids: Bid[]
router.get('/user/bid/owned', (req, res, next) => {
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
//  amount (Integer - Default 1)
// TODO: Respond with detailed error message
router.post('/user/bid', (req, res, next) => {
  if (!req.body.typeId || !req.body.bidPrice) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  bids.createBids(req.body.typeId, req.user!.id, req.body.bidPrice, req.body.amount || 1)
    .then(() => {
      res.status(201).send({ message: 'Bid created' });
    })
    .catch((error: any) => {
      console.log('There was an error creating the bid:', error);
      res.status(400).send({ message: error.message });
    });
});

// PUT/PATCH REQUESTS //

// Update a bid price
// Expects in req.body:
//  bidId (Integer)
//  bidPrice (Decimal)
// TODO: Respond with detailed error message
router.put('/user/bid/price', (req, res, next) => {
  if (!req.body.bidId || !req.body.bidPrice) {
    return res.status(400).send({ message: 'Missing body parameters' });
  }
  bids.updateBidPrice(req.body.bidId, req.body.bidPrice, req.user!.id)
    .then(() => {
      res.status(201).send({ message: 'Bid price updated' });
    })
    .catch((error: any) => res.status(400).send({ message: error.message }));
});

// DELETE REQUESTS //

// Remove a bid
// Expects in req.query:
//  bidId
router.delete('/user/bid', (req, res, next) => {
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
