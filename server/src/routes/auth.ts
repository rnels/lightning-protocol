import * as accounts from '../models/accountModel';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Router } from 'express';
import { Request, Response } from 'express-serve-static-core';
const router = Router();

const authHelper = (req: Request, res: Response, next=()=>{}) => {
  passport.authenticate('local', (err, user, errorInfo) => {
    if (err) return res.sendStatus(500);
    if (!user) return res.status(400).send(errorInfo.message);
    req.logIn(user, function (err) {
      if (err) return res.status(400).send({message: 'Login failed'});
      return res.status(200).send({
        message: 'Login successful',
        user
      });
    });
  })(req, res, next);
};

// POST REQUESTS //

router.post('/register', (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email && password) {
    res.status(400).send({ message: 'Please fill in email field' });
  } else if (!password && email) {
    res.status(400).send({ message: 'Please fill in password field' });
  } else if (
    !email ||
    !password ||
    !firstName ||
    !lastName
  ) {
    res.status(400).send({ message: 'Please fill in all required fields' });
  } else {
    accounts
      .getAccountAuthByEmail(email)
      .then((accountInfo: any) => {
        if (accountInfo.rows[0]) {
          res.status(400).send({ message: 'Email already in use' });
        } else {
          bcrypt.hash(password, 12, function (err, hash) {
            if (err) {
              console.log(err);
            }
            accounts
              .createAccount({
                email,
                passwordHash: hash,
                firstName,
                lastName,
              })
              .then((user) => authHelper(req, res, next))
              .catch((err) => {
                console.log('Login / registration error:', err);
                res.status(500).send({ message: 'Internal login / registration error' });
              });
          });
        }
      })
      .catch((err) => {
        console.log('Registration error:', err);
        res.status(500).send({ message: 'Internal registration error' });
      });
  }
});

// LOGIN
// Session is established after authentication
router.post('/login', (req, res, next) => {
  authHelper(req, res, next);
});

// LOGOUT
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      res.clearCookie('lightning-app-cookie');
      res.status(201).send({ message: 'You are logged out!' });
    });
  });
});

// Authenticate all user requests
// Users should not be able to access any resources without being signed in
router.use('/', (req, res, next) => {
  // if (!req.user) { // DEBUG: Uncomment for testing auth
  //   req.user = {
  //     id: 1
  //   }
  // }
  if (!req.user) {
    res.status(403).send({ message: 'Login required' });
  } else {
    next();
  }
});

export default router;
