import auth from './auth';
import account from './account';
import asset from './asset';
import contract from './contract';
import pool from './pool';

export default {
  auth, // Auth must always come first
  account,
  asset,
  contract,
  pool
};
