import * as accounts from '../models/accountModel';
import * as accountTokens from '../models/accountTokenModel';
import { Router } from 'express';
import { AccountToken } from '../types';
const router = Router();

// GET REQUESTS //

// Get public info for authenticated user account
// Successful response data:
// account: {
//   account_id
//   email
//   first_name
//   last_name
// }
router.get('/account', (req, res) => {
  accounts.getAccountInfoById(req.user!.id)
    .then((result) => {
      let account = result.rows[0];
      res.status(200).send({account});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving account info' }));
});

// Get account token balances for authenticated user account
// Successful response data:
// accountToken: {
//   account_tokens_id
//   account_id
//   token_id
//   token_amount
// }
router.get('/account/token', (req, res) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'Missing query parameter: id' });
  }
  accountTokens.getAccountTokensByTokenId(req.user!.id, req.query.id as string)
    .then((result) => {
      let accountToken = result.rows[0];
      res.status(200).send({accountToken});
    })
    .catch((error: any) => res.status(404).send({ message: `Error retrieving account token info for tokenId ${req.query.id}` }));
});

// Get account token balances for authenticated user account
// Successful response data:
// accountTokens: [accountToken]
router.get('/account/token/list', (req, res) => {
  accountTokens.getAccountTokensByAccountId(req.user!.id)
    .then((result) => {
      let accountTokens = result.rows;
      res.status(200).send({accountTokens});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving account token info' }));
});

// POST REQUESTS //

// Create a token supply (or deposit, if token supply already exists in account)
// TODO: Change the order where depositing does not require a check if the supply exists already,
// instead does it the other way around, just create a record if it doesn't yet exist
router.post('/account/deposit', (req, res) => {
  if (!req.body.id || !req.body.amount) {
    return res.status(400).send({ message: 'Missing query parameters' });
  }
  let accountToken: AccountToken = {
    accountId: req.user!.id,
    tokenId: req.body.id,
    tokenAmount: req.body.amount
  }
  accountTokens.createAccountTokensForTokenId(accountToken)
    .then((result) => res.status(201).send({ message: 'Token supply deposited' }))
    .catch((error: any) => {
      console.log('Error creating token supply:', error);
      return res.status(400).send({ message: `Error creating token supply for tokenId ${req.body.tokenId}` });
    });
});

export default router;
