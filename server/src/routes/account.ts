import * as model from '../models/accountModel';
import { Router } from 'express';
const router = Router();

// GET REQUESTS //

// Get public info for a user
router.get('/account', (req, res) => {
  model.getAccountInfoById(req.user!.id)
    .then((result) => {
      let account = result.rows[0];
      res.status(200).send({account});
    })
    .catch((error: any) => res.status(404).send({ message: 'Error retrieving account info' }));
});

export default router;
