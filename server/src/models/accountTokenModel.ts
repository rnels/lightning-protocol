import db from '../db/db';
import { AccountToken } from '../types';

// TODO: Write tests for this model

// Can be used to get all token balances for an account
export function getAccountTokensByAccountId(accountId: string | number) {
  return db.query(`
    SELECT
      *
    FROM account_tokens
      WHERE account_id=$1
  `, [accountId]);
};

// Can be used to get specific token balance for an account
export function getAccountTokensByTokenId(accountId: string | number, tokenId: string | number) {
  return db.query(`
    SELECT
      *
    FROM account_tokens
      WHERE account_id=$1
        AND token_id=$2
  `, [accountId, tokenId]);
};

// TODO: Need to be sure that there is only one record for the balances of each account_id - token_id pair
export function createAccountTokensForTokenId(accountToken: AccountToken) {
  return db.query(`
    INSERT INTO account_tokens (
      account_id,
      token_id,
      token_amount
    ) VALUES ($1, $2, $3)
  `,
  [
    accountToken.accountId,
    accountToken.tokenId,
    accountToken.tokenAmount
  ]);
};

// export function updateAccountTokenBalance(accountToken: AccountToken) {
//   return db.query(`
//     UPDATE account_tokens
//     SET token_amount=$3
//       WHERE account_id=$1
//       AND token_id=$2
//   `,
//   [
//     accountToken.accountId,
//     accountToken.tokenId,
//     accountToken.tokenAmount
//   ]);
// };

export function depositAccountTokenBalance(accountToken: AccountToken) {
  return db.query(`
    UPDATE account_tokens
    SET token_amount=token_amount+$3
      WHERE account_id=$1
        AND token_id=$2
  `,
  [
    accountToken.accountId,
    accountToken.tokenId,
    accountToken.tokenAmount
  ]);
};

export function withdrawAccountTokenBalance(accountToken: AccountToken) {
  return db.query(`
    UPDATE account_tokens
    SET token_amount=token_amount-$3
      WHERE account_id=$1
        AND token_id=$2
  `,
  [
    accountToken.accountId,
    accountToken.tokenId,
    accountToken.tokenAmount
  ]);
};
