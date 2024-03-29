import * as trades from '../../models/tradeModel';
import { Router } from 'express';
import { Trade } from '../../types';
const router = Router();

// GET REQUESTS //

// Get trade info by trade ID
// Expects in req.query:
//  id - Trade ID to retrieve details of
// Successful response data:
// trade: {
//  tradeId
//  contractId
//  typeId
//  salePrice
//  saleCost
//  tradeFee
//  createdAt
// }
router.get('/user/trade', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  trades.getTradeById(req.query.id as string, req.user!.id)
    .then((trade) => {
      res.status(200).send({trade});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving trade info' }));
});

// Get all trades for an authenticated user
// Successful response data:
// trades: Trade[]
router.get('/user/trade/list', (req, res, next) => {
  trades.getTradesByAccountId(req.user!.id)
    .then((trades) => {
      res.status(200).send({trades})
    })
    .catch((error: any) => {
      res.status(404).send({ message: 'Error retrieving trade info' });
      console.log(error);
    });
});

// TODO: Create route to get historical trade data on contracts
// Will be used to get day-over-day price change %

export default router;
