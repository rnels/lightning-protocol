import auth from './auth';
import account from './account';
import token from './token';
import contract from './contract';
import pool from './pool';

export default {
  auth, // Auth must always come first
  account,
  token,
  contract,
  pool
};
