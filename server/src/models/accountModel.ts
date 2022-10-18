import db from '../db/db';
import { Account } from '../types';

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

export function getAccountAuthByEmail(email: string){
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
  `, [account.email, account.passwordHash, account.firstName, account.lastName, account.paper])
    .then((createRes: any) => createRes.rows[0]);
};

export function addPaper(accountId: string | number, amount: number) {
  return db.query(`
    UPDATE accounts
    SET paper=paper+$2
      WHERE account_id=$1
  `,
  [
    accountId,
    amount
  ]);
};