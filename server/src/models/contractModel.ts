import db from '../db/db';
import { Contract, PoolLock } from '../types';
import { getContractTypeById } from './contractTypeModel';
import { createPoolLock, getPoolsByAssetId, getUnlockedAmountByAssetId, getUnlockedAmountByPoolId } from './poolModel';

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
  let assetId = (await getContractTypeById(contract.typeId)).rows[0].asset_id;
  let unlockedPoolAssetTotal = await getUnlockedAmountByAssetId(assetId);
  if (unlockedPoolAssetTotal < contract.assetAmount) throw new Error('Not enough unlocked assets to create contract')
  let contractId = (await db.query(`
    INSERT INTO contracts (
      type_id,
      owner_id,
      ask_price,
      asset_amount,
      exercised
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING contract_id
  `,
  [
    contract.typeId,
    contract.ownerId,
    contract.askPrice,
    contract.assetAmount,
    contract.exercised
  ])).rows[0].contract_id;
  let pools = (await getPoolsByAssetId(assetId)).rows;
  let unallocatedAmount = contract.assetAmount;
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

// TODO: Flesh this out as needed
export function updateExercised(contractId: string | number, exercised: boolean, ownerId: string | number) {
  return db.query(`
    UPDATE contracts
    SET exercised=$2
      WHERE contract_id=$1
        AND owner_id=$3
  `,
  [
    contractId,
    exercised,
    ownerId
  ]);
};
