import * as trades from '../models/tradeModel';
import { Router } from 'express';
import { Trade } from '../types';
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
router.get('/trade', (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  trades.getTradeById(req.query.id as string)
    .then((trade) => {
      res.status(200).send({trade});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving trade info' }));
});

// Get last trade of a contract with a given typeId
// Expects in req.query:
//  typeId - Contract type ID to retrieve last trade of
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
router.get('/trade/last', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  trades.getLastTradeByTypeId(req.query.typeId as string)
    .then((trade) => {
      res.status(200).send({trade});
    })
    .catch((error: any) => {
      res.status(404).send({ message: 'Error retrieving trade info' });
      console.log(error);
    });
});

// Get last 24 hours of trades for a given typeId
// Expects in req.query:
//  typeId - Contract type ID to retrieve trades of
// Successful response data:
// trades: Trade[]
router.get('/trade/daily', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  trades.getTradesWithin24HoursByTypeId(req.query.typeId as string)
    .then((trades) => {
      res.status(200).send({trades});
    })
    .catch((error: any) => {
      res.status(404).send({ message: 'Error retrieving trade info' });
      console.log(error);
    });
});

// Get all trades for an authenticated user
// Successful response data:
// trades: Trade[]
router.get('/trade/owned', (req, res, next) => {
  trades.getTradesByAccountId(req.user!.id)
    .then((trades) => {
      res.status(200).send({trades})
    })
    .catch((error: any) => {
      res.status(404).send({ message: 'Error retrieving trade info' });
      console.log(error);
    });
});

// Get average price difference from last 24 hours of trades to the prior 24 hours
// Expects in req.query:
//  typeId - Contract type ID to retrieve trades of
// Successful response data:
// priceChange: number
router.get('/trade/daily/change', (req, res, next) => {
  if (!req.query.typeId) {
    return res.status(400).send({ message: 'Missing query parameter: typeId' });
  }
  trades.getTradeAvgSalePrice24HourChange(req.query.typeId as string)
    .then((priceChange) => {
      res.status(200).send({priceChange});
    })
    .catch((error: any) => {
      res.status(404).send({ message: 'Error retrieving sale price info' });
      console.log(error);
    });
});



// TODO: Create route to get historical trade data on contracts
// Will be used to get day-over-day price change %

export default router;
