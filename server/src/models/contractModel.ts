import db from '../db/db';
import { Bid, Contract, PoolLock, Trade } from '../types';
import { depositPaper, withdrawPaper } from './accountModel';
import { removeBid } from './bidModel';
import { getContractTypeById } from './contractTypeModel';
import { createPoolLock, getPoolsByAssetId, getUnlockedAmountByAssetId, getUnlockedAmountByPoolId } from './poolModel';
import { createTrade } from './tradeModel';

// The seller should be credited the sale price - (sale price * pool fee)
// Wait until the end to update records (owner, trades)
async function tryExecuteTrade(contract: Contract, buyerId: number) {
  let salePrice = contract.askPrice!;
  console.log('askPrice', contract.askPrice);
  console.log('buyerId', buyerId);
  console.log('sellerId', contract.ownerId);
  try { await withdrawPaper(buyerId, salePrice); }
  catch {
    throw new Error('Buyer doesn\'t have the funds to make this trade');
  }
  let tradeFee = salePrice * 0.01; // TODO: Don't hardcode the 1% fee
  let sellerProceeds = salePrice - tradeFee;
  depositPaper(contract.ownerId, sellerProceeds);
  let trade: Trade = {
    contractId: contract.contractId as number,
    buyerId: buyerId,
    sellerId: contract.ownerId,
    salePrice,
    tradeFee
  };
  createTrade(trade);
  await removeAskPrice(contract.contractId as number, contract.ownerId);
  updateOwnerId(contract, buyerId);
}

// TODO: Flesh this out as needed
// Used ONLY internally, DO NOT call this from any router functions because it does not verify ownerId
function updateExercised(contract: Contract, exercised: boolean) {
  return db.query(`
    UPDATE contracts
    SET exercised=$2
      WHERE contract_id=$1
  `,
  [
    contract.contractId,
    exercised
  ]);
};

// Used ONLY making a trade, DO NOT call this from any router functions because it does not verify ownerId
function updateOwnerId(contract: Contract, newOwnerId: number) {
  return db.query(`
    UPDATE contracts
    SET owner_id=$2
      WHERE contract_id=$1
  `,
  [
    contract.contractId,
    newOwnerId
  ]);
};

// Finds matching contracts with ask prices lower than or equal to the provided bid price
// If there are matches, executes a trade on the lowest price contract
// TODO: Create this function but for the other side, updating an ask and comparing against an updated list of bids
export async function getMatchingAsksByBid(bid: Bid) {
  let contracts = (await
    db.query(`
      SELECT contracts.*
        FROM contracts, contract_types
        WHERE contracts.type_id=$1
          AND contracts.ask_price<=$2
          AND contracts.exercised=false
          AND contract_types.expires_at < NOW()
          AND contracts.type_id=contract_types.contract_type_id
        ORDER BY contracts.ask_price ASC
    `, [bid.typeId, bid.bidPrice])
  ).rows;
  if (contracts.length === 0) throw new Error('No matching asks exist for the provided bid');
  let contract: Contract = {
    contractId: contracts[0].contract_id,
    typeId: contracts[0].type_id,
    ownerId: contracts[0].owner_id,
    askPrice: contracts[0].ask_price,
    createdAt: contracts[0].created_at,
    exercised: contracts[0].exercised
  }
  try {
    await tryExecuteTrade(contract, bid.accountId);
    return removeBid(bid.bidId as number, bid.accountId);
  } catch {

  }
}

export function getAllContracts(sort='contract_id ASC', count=10) {
  return db.query(`
    SELECT *
      FROM contracts
    ORDER BY $1
    LIMIT $2
  `, [sort, count]);
};

export function getContractById(id: string | number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE contract_id=$1
  `, [id]);
};

export function getContractsByTypeId(typeId: string | number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE type_id=$1
  `, [typeId]);
};

export function getContractsByOwnerId(ownerId: string | number) {
  return db.query(`
    SELECT *
      FROM contracts
      WHERE owner_id=$1
  `, [ownerId]);
};

// Creates a contract, locks in amounts to pools
// TODO: Create process of allocating fees, unlocking locked pools on expiry
export async function createContract(contract: Contract) {
  let contractType = (await getContractTypeById(contract.typeId)).rows[0];
  let unlockedPoolAssetTotal = await getUnlockedAmountByAssetId(contractType.asset_id);
  if (unlockedPoolAssetTotal < contractType.asset_amount) throw new Error('Not enough unlocked assets to create contract')
  let contractId = (await db.query(`
    INSERT INTO contracts (
      type_id,
      owner_id,
      ask_price,
      exercised
    ) VALUES (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING contract_id
  `,
  [
    contract.typeId,
    contract.ownerId,
    contract.askPrice,
    contract.exercised
  ])).rows[0].contract_id;
  let pools = (await getPoolsByAssetId(contractType.asset_id)).rows;
  let unallocatedAmount = contractType.asset_amount;
  let poolLockPromises = [];
  // Okay, so this should create a pool lock for all pools with
  // Unlocked assets, cascading down until the contract is spent on locks
  for (let pool of pools) {
    let unlockedAmount = await getUnlockedAmountByPoolId(pool.pool_id); // TODO: Could technically get locked amounts and do the sum here
    if (unlockedAmount > 0) {
      let allocatedAmount = unallocatedAmount >= unlockedAmount ? unlockedAmount : unallocatedAmount;
      let poolLock: PoolLock = {
        poolId: pool.pool_id,
        contractId,
        assetAmount: allocatedAmount,
        expired: false
      }
      poolLockPromises.push(
        createPoolLock(poolLock)
      );
      unallocatedAmount -= allocatedAmount;
      if (!unallocatedAmount) break; // TODO: This assumes unallocatedAmount will hit 0, but I am predicting number accuracy errors ha ha let's see
    }
  }
  return Promise.all(poolLockPromises);
};

export function updateAskPrice(contractId: string | number, askPrice: number, ownerId: string | number) {
  return db.query(`
    UPDATE contracts
    SET ask_price=$2
      WHERE contract_id=$1
        AND owner_id=$3
  `,
  [
    contractId,
    askPrice,
    ownerId
  ]);
};

// For use where a contract is either sold or the listing is removed
export function removeAskPrice(contractId: string | number, accountId: string | number) {
  return db.query(`
    UPDATE contracts
    SET ask_price=null
      WHERE contract_id=$1
      AND owner_id=$2
  `,
  [
    contractId,
    accountId
  ]);
};
