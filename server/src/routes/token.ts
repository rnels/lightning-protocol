import * as tokens from '../models/tokenModel';
import { Router } from 'express';
const router = Router();

// GET REQUESTS //

// Get token info by token ID
// Expects in req.query:
//  id - Token ID to retrieve details of
// Successful response data:
// token: {
//   token_id
// }
router.get('/token', (req, res, next) => {
  if (!req.query.id) return res.status(400).send({message: 'Missing query parameter: id'});
  tokens.getTokenById(req.query.id as string)
    .then((result) => {
      let token = result.rows[0];
      res.status(200).send({token});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving token info' }));
});

// Successful response data:
// tokens: [token]
router.get('/token/list', (req, res, next) => {
  tokens.getAllTokens()
    .then((result) => {
      let tokens = result.rows;
      res.status(200).send({tokens});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving token list' }));
});

export default router;
