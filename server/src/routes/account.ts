import * as accounts from '../models/accountModel';
import { Router } from 'express';
import { Account } from '../types';
const router = Router();

// GET REQUESTS //

// Get public info for authenticated user account
// Successful response data:
// account: {
//   accountId
//   email
//   firstName
//   lastName
//   paper
// }
router.get('/account', (req, res) => {
  accounts.getAccountInfoById(req.user!.id)
    .then((account) => {
      res.status(200).send({account});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving account info' }));
});

// POST REQUESTS //

// Provide an account with paper
// Expects in req.body:
//  amount (Decimal) - Amount of paper to supply the account with
router.post('/account/paper', (req, res) => {
  if (!req.body.amount) {
    return res.status(400).send({ message: 'Missing body parameter: amount' });
  }
  accounts.depositPaper(req.user!.id, req.body.amount)
    .then(() => res.status(201).send({ message: 'Paper deposited to account' }))
    .catch((error: any) => res.status(400).send({ message: 'Error depositing paper to account' }));
});

router.post('/account/paper/withdraw', (req, res) => {
  if (!req.body.amount) {
    return res.status(400).send({ message: 'Missing body parameter: amount' });
  }
  accounts.withdrawPaper(req.user!.id, req.body.amount)
    .then(() => res.status(201).send({ message: 'Paper withdrawn from account' }))
    .catch((error: any) => res.status(400).send({ message: error.message }));
});

export default router;
