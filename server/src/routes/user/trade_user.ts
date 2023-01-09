import * as trades from '../../models/tradeModel';
import { Router } from 'express';
import { Trade } from '../../types';
const router = Router();

// GET REQUESTS //

// Get all trades for an authenticated user
// Successful response data:
// trades: Trade[]
router.get('/user/trade/owned', (req, res, next) => {
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
