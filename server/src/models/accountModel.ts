import { PoolClient } from 'pg';
import db from '../db/db';
import { Account } from '../types';

// TODO: Get rid of any route response that exposes account_id
// Bids, contracts, pools, etc should be anonymous

export function getAccountInfoById(id: string | number) {
  return db.query(`
    SELECT
      account_id,
      email,
      first_name,
      last_name,
      paper
    FROM accounts
      WHERE account_id=$1
  `, [id]);
};

// INTERNAL METHOD: DATA NOT TO BE RETURNED TO CLIENT
export function _getAccountAuthByEmail(email: string){
  return db.query(`
    SELECT
      account_id,
      email,
      pw_hash
    FROM accounts
      WHERE email=$1
  `, [email]);
};

// account.email
// account.passwordHash
// account.firstName
// account.lastName
// account.paper
export function createAccount(account: Account) {
  return db.query(`
    INSERT INTO accounts(
      email,
      pw_hash,
      first_name,
      last_name,
      paper
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING account_id
  `, [account.email, account.passwordHash, account.firstName, account.lastName, account.paper]);
};

export function depositPaper(accountId: string | number, amount: number, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  return query(`
    UPDATE accounts
    SET paper=paper+$2
      WHERE account_id=$1
  `,
  [
    accountId,
    amount
  ]);
};

export function withdrawPaper(accountId: string | number, amount: number, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  return query(`
    UPDATE accounts
    SET paper=paper-$2
      WHERE account_id=$1
  `,
  [
    accountId,
    amount
  ]);
};