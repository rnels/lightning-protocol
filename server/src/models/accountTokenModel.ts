import db from '../db/db';
import { AccountToken } from '../types';

// TODO: Write tests for this model

async function checkAccountTokenPairExists(accountId: string | number, tokenId: string | number): Promise<boolean> {
  return (
    await getAccountTokensByTokenId(accountId, tokenId)
  ).rows.length > 0;
};

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

export async function createAccountTokensForTokenId(accountToken: AccountToken) {
  let exists = await checkAccountTokenPairExists(accountToken.accountId, accountToken.tokenId);
  if (exists) return depositAccountTokenBalance(accountToken);
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
