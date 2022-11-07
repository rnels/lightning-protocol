import db from '../db/db';
import { Asset, Contract, ContractType, Pool } from '../types';
import { getAllAssets, getAssetById } from './assetModel';
import { getBidsByContractTypeId } from './bidModel';
import { getContractsByTypeId, getContractsByTypeIdOwnerId } from './contractModel';
import { getContractTypesByAssetId } from './contractTypeModel';
import { getPoolByAccountAssetIds, getPoolLocksByPoolId, getPoolsByAssetId } from './poolModel';
import { getTradesByContractId } from './tradeModel';

export async function getAssetGroup(): Promise<Asset[]> {
  let assets = await getAllAssets();
  for (let asset of assets) {
    asset.pools = await getPoolGroup(asset.assetId);
    asset.contractTypes = await getContractTypeGroup(asset.assetId);
  }
  return assets;
}

export async function getAssetGroupById(assetId: string | number): Promise<Asset> {
  let asset = await getAssetById(assetId);
  asset.pools = await getPoolGroup(asset.assetId);
  asset.contractTypes = await getContractTypeGroup(asset.assetId);
  return asset;
}

export async function getAssetGroupOwned(accountId: string | number): Promise<Asset[]> {
  let assets = await getAllAssets();
  for (let asset of assets) {
    asset.pools = [await getPoolGroupOwned(asset.assetId,  accountId)];
    asset.contractTypes = await getContractTypeGroupOwned(asset.assetId, accountId);
  }
  return assets;
}

export async function getAssetGroupOwnedById(assetId: string | number, accountId: string | number): Promise<Asset> {
  let asset = await getAssetById(assetId);
  asset.pools = [await getPoolGroupOwned(asset.assetId,  accountId)];
  asset.contractTypes = await getContractTypeGroupOwned(asset.assetId, accountId);
  return asset;
}

// NOTE: Does NOT include expired pool locks
export async function getPoolGroup(assetId: string | number): Promise<Pool[]> {
  let pools = await getPoolsByAssetId(assetId);
  for (let pool of pools) {
    pool.poolLocks = await getPoolLocksByPoolId(pool.poolId);
  }
  return pools;
}

// NOTE: Does NOT include expired pool locks
export async function getPoolGroupOwned(assetId: string | number, accountId: string | number): Promise<Pool> {
  let pool = await getPoolByAccountAssetIds(accountId, assetId);
  pool.poolLocks = await getPoolLocksByPoolId(pool.poolId);
  return pool;
}

// NOTE: Includes expired contract types
export async function getContractTypeGroup(assetId: string | number): Promise<ContractType[]> {
  let contractTypes = await getContractTypesByAssetId(assetId);
  for (let contractType of contractTypes) {
    contractType.contracts = await getContractGroup(contractType.contractTypeId);
    contractType.bids = await getBidsByContractTypeId(contractType.contractTypeId);
  }
  return contractTypes;
}

// NOTE: Includes expired contract types
export async function getContractTypeGroupOwned(assetId: string | number, accountId: string | number): Promise<ContractType[]> {
  let contractTypes = await getContractTypesByAssetId(assetId);
  for (let contractType of contractTypes) {
    contractType.contracts = await getContractGroupOwned(contractType.contractTypeId, accountId);
    contractType.bids = await getBidsByContractTypeId(contractType.contractTypeId);
  }
  return contractTypes;
}

// NOTE: Includes exercised contracts
export async function getContractGroup(typeId: string | number): Promise<Contract[]> {
  let contracts = await getContractsByTypeId(typeId);
  for (let contract of contracts) {
    contract.trades = await getTradesByContractId(contract.contractId);
  }
  return contracts;
}

// NOTE: Includes exercised contracts
export async function getContractGroupOwned(typeId: string | number, accountId: string | number): Promise<Contract[]> {
  let contracts = await getContractsByTypeIdOwnerId(typeId, accountId);
  for (let contract of contracts) {
    contract.trades = await getTradesByContractId(contract.contractId); // TODO: Should only get trades since the point I owned it
  }
  return contracts;
}

// // NOTE: Includes exercised contracts
// // This works, but it's too difficult a format to follow for the higher nested versions
// export async function getContractGroupOneQ(typeId: string | number, sort='contract_id ASC'): Promise<Contract[]> {
//   const res = await db.query(`
//     SELECT
//       contract_id as "contractId",
//       type_id as "typeId",
//       owner_id as "ownerId",
//       ask_price as "askPrice",
//       created_at as "createdAt",
//       exercised,
//       exercised_amount as "exercisedAmount",
//       (
//         SELECT array_to_json(coalesce(array_agg(trade), array[]::record[]))
//         FROM (
//           SELECT
//             trade_id as "tradeId",
//             contract_id as "contractId",
//             type_id as "typeId",
//             buyer_id as "buyerId",
//             seller_id as "sellerId",
//             sale_price as "salePrice",
//             sale_cost as "saleCost",
//             trade_fee as "tradeFee",
//             created_at as "createdAt"
//           FROM trades
//             WHERE trades.contract_id=contracts.contract_id
//         ) trade
//       ) as trades
//     FROM contracts
//       WHERE type_id=$1
//     ORDER BY $2
//   `, [typeId, sort]);
//   return res.rows;
// }
