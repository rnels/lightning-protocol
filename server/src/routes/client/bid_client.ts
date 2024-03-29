import * as bids from '../../models/bidModel';
import { Router } from 'express';
import { Bid } from '../../types';
const router = Router();

// GET REQUESTS //

// Retrieve bids for a given contract type ID
// Expects in req.query:
//  typeId - Contract type ID to retrieve bids of
// Successful response data:
// bids: Bid[]
router.get('/client/bid/type', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  bids.getBidsByContractTypeId(req.query.typeId as string)
    .then((bids) => {
      res.status(200).send({bids});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving bid list' }));
});

export default router;
