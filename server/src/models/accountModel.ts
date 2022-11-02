import { PoolClient, QueryResult } from 'pg';
import db from '../db/db';
import { Account } from '../types';

// TODO: Get rid of any route response that exposes account_id
// Bids, contracts, pools, etc should be anonymous

export async function getAccountInfoById(id: string | number): Promise<Account> {
  const res = await db.query(`
    SELECT
      account_id as "accountId",
      email,
      first_name as "firstName",
      last_name as "lastName",
      paper
    FROM accounts
      WHERE account_id=$1
  `, [id]);
  return res.rows[0];
};

// INTERNAL METHOD: DATA NOT TO BE RETURNED TO CLIENT
export async function _getAccountAuthByEmail(email: string): Promise<{accountId: number, email: string, passwordHash: string}>{
  const res = await db.query(`
    SELECT
      account_id as "accountId",
      email,
      pw_hash as "passwordHash"
    FROM accounts
      WHERE email=$1
  `, [email]);
  return res.rows[0];
};

// account.email
// account.passwordHash
// account.firstName
// account.lastName
// account.paper
export async function createAccount(email: string, passwordHash: string, firstName: string, lastName: string): Promise<{accountId: number}>{
  const res = await db.query(`
    INSERT INTO accounts(
      email,
      pw_hash,
      first_name,
      last_name
    ) VALUES ($1, $2, $3, $4)
    RETURNING account_id as accountId
  `, [email, passwordHash, firstName, lastName]);
  return res.rows[0];
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

// TODO: Create lock mode
export async function withdrawPaper(accountId: string | number, amount: number, client?: PoolClient) {
  let query = db.query.bind(db);
  if (client) { query = client.query.bind(client); }
  // TODO: Ensure this works
  await query('LOCK TABLE accounts IN ROW EXCLUSIVE MODE');
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
