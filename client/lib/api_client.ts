import { serverURL } from '../config';
import { Asset, Bid, Contract, ContractType, Pool, PoolLock, Trade } from './types';

// CONTRACTS //

export function getContractListByType(typeId: string | number): Promise<Contract[]> {
  var url = new URL(`${serverURL}/client/contract/list`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contracts);
}

// Extended nested info using groups route
export function getContractListByTypeExt(typeId: string | number): Promise<Contract[]> {
  var url = new URL(`${serverURL}/client/group/contract`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contracts);
}

export function getAsks(typeId: string | number): Promise<{askPrice: string | number, contractId: number}[]> {
  var url = new URL(`${serverURL}/client/contract/type/asks`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.asks);
}

// CONTRACT TYPES //

// NOTE: Only gets active contractTypes
export function getContractTypesByAssetId(assetId: string | number): Promise<ContractType[]> {
  var url = new URL(`${serverURL}/client/contract/type/list`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contractTypes);
}

export function getTopBadgedContractTypes(assetId: string | number, direction: boolean): Promise<ContractType[]> {
  var url = new URL(`${serverURL}/client/contract/type/badged/top`);
  url.searchParams.append('assetId', assetId as string);
  url.searchParams.append('direction', direction.toString());
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contractTypes);
}

export function getFeaturedContractTypes(assetId: string | number, direction: boolean): Promise<ContractType[]> {
  var url = new URL(`${serverURL}/client/contract/type/featured`);
  url.searchParams.append('assetId', assetId as string);
  url.searchParams.append('direction', direction.toString());
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contractTypes);
}

export function getContractTypesByAssetIdExt(assetId: string | number): Promise<ContractType[]> {
  var url = new URL(`${serverURL}/client/group/contract/type`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contractTypes);
}

// BIDS //

export function getBidsByType(typeId: string | number): Promise<Bid[]> {
  var url = new URL(`${serverURL}/client/bid/type`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.bids);
}

// TRADES //

export function getLastTrade(typeId: string | number): Promise<Trade> {
  var url = new URL(`${serverURL}/client/trade/last`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.trade);
}

export function getDailyTrades(typeId: string | number): Promise<Trade[]> {
  var url = new URL(`${serverURL}/client/trade/daily`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.trades);
}

export function getDailyPriceChange(typeId: string | number): Promise<number> {
  var url = new URL(`${serverURL}/client/trade/daily/change`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.priceChange);
}

// ASSETS //

export function getAsset(assetId: string | number): Promise<Asset> {
  var url = new URL(`${serverURL}/client/asset`);
  url.searchParams.append('id', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.asset);
}

export function getAssetList(): Promise<Asset[]> {
  var url = new URL(`${serverURL}/client/asset/list`);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assets);
}

export function getAssetListExt(): Promise<Asset[]> {
  var url = new URL(`${serverURL}/client/group/asset`);
  return fetch(url, {
    method: 'GET',
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assets);
}

export function getAssetByIdExt(assetId: string | number): Promise<Asset[]> {
  var url = new URL(`${serverURL}/client/group/asset/id`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assets);
}

export function getAssetPrice(assetId: string | number): Promise<number> {
  var url = new URL(`${serverURL}/client/asset/price`);
  url.searchParams.append('id', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => Number(json.price));
}

export function getAssetPriceHistory(
  assetId: string | number,
  days: string | number
): Promise<{price: string | number, dataPeriod: string}[]> {
  var url = new URL(`${serverURL}/client/asset/price/history`);
  url.searchParams.append('id', assetId as string);
  url.searchParams.append('days', days as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.prices);
}

// POOLS //

export function getPoolsByAssetId(assetId: string | number): Promise<Pool[]> {
  var url = new URL(`${serverURL}/client/pool/list`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.pools);
}

export function getPoolsByAssetIdExt(assetId: string | number): Promise<Pool[]> {
  var url = new URL(`${serverURL}/client/group/pool`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.pools);
}

export function getPoolAssetAmountByAssetId(assetId: string | number): Promise<number> {
  var url = new URL(`${serverURL}/client/pool/asset`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assetAmount);
}

export function getPoolLocksByPoolId(poolId: string | number): Promise<PoolLock[]> {
  var url = new URL(`${serverURL}/client/pool/lock`);
  url.searchParams.append('id', poolId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.poolLocks);
}

export function getPoolLockAssetAmountByAssetId(assetId: string | number): Promise<number> {
  var url = new URL(`${serverURL}/client/pool/lock/asset`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assetAmount);
}