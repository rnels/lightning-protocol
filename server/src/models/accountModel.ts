import db from '../db/db';
import { Account } from '../types';

export function getAccountInfoById(accountId: number) {
  return db.query(`
    SELECT
      account_id,
      email,
      first_name,
      last_name
    FROM accounts
      WHERE account_id=$1
  `, [accountId]);
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
export function createAccount(account: Account) {
  return db.query(`
    INSERT INTO accounts(
      email,
      pw_hash,
      first_name,
      last_name
    ) VALUES ($1, $2, $3, $4)
    RETURNING account_id
  `, [account.email, account.passwordHash, account.firstName, account.lastName])
    .then((createRes: any) => createRes.rows[0]);
};
