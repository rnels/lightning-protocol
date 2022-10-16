import * as accounts from '../../models/accountModel';

// Will eventually replace this with jest testing in queries.test.js, but for now...

// ACCOUNTS //
// NOTE: Since we are creating a pw hash directly rather than going through auth
// we can't log in to these accounts using a service like postman to test the routes

// CREATE ACCOUNT
(async () => {
  let account = {
    email: 'guy@test.com',
    passwordHash: '3oi2jrfldsk290u',
    firstName: 'Guy',
    lastName: 'Person'
  }
  let result = await accounts.createAccount(account);
  console.log(result);
});

// GET ACCOUNTS INFO
(async () => {
  let accountId = 1;
  let result = await accounts.getAccountInfoById(accountId);
  console.log(result);
});
