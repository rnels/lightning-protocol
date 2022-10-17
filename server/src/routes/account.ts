import * as accounts from '../models/accountModel';
import { Router } from 'express';
const router = Router();

// GET REQUESTS //

// Get public info for an authenticated user account
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

export default router;
