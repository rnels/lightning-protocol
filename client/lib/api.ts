import axios from './axios';
import { serverURL } from '../config';
import { Account, Asset, Bid, Contract, ContractType, Pool, PoolLock, Trade } from './types';

// ACCOUNTS //

export function getAccount(cookie?: string): Promise<Account> {
  return fetch(`${serverURL}/account`, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include',
    cache: 'no-store',
    next: {}
  })
    .then((result) => result.json())
    .then((json) => json.account);
}

export function registerAccount(email: string, password: string, firstName: string, lastName: string) {
  return axios.post(`${serverURL}/register`, {
    firstName,
    lastName,
    email,
    password
  })
    .then((response) => response.data);
}

export function loginAccount(email: string, password: string) {
  return axios.post(`${serverURL}/login`, {
    email,
    password
  })
    .then((response) => response.data);
}

export function logoutAccount() {
  return axios.post(`${serverURL}/logout`)
    .then((response) => response.data);
}

export function depositPaper(amount: number) {
  return axios.post(`${serverURL}/account/paper`, { amount })
    .then((response) => response.data);
}

// CONTRACTS //

export function getContract(contractId: string | number, cookie?: string): Promise<Contract> {
  var url = new URL(`${serverURL}/contract`);
  url.searchParams.append('id', contractId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contract);
  // return axios.get(`${serverURL}/contract`, {
  //   params: { id: contractId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.contract)
}


export function getContractListByType(typeId: string | number, cookie?: string): Promise<Contract[]> {
  var url = new URL(`${serverURL}/contract/list`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contracts);
  // return axios.get(`${serverURL}/contract/list`, {
  //   params: { typeId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.contracts)
}

// Extended nested info using groups route
export function getContractListByTypeExt(typeId: string | number, cookie?: string): Promise<Contract[]> {
  var url = new URL(`${serverURL}/group/contract`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contracts);
  // return axios.get(`${serverURL}/group/contract`, {
  //   params: { typeId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.contracts);
}

export function getUserContracts(cookie?: string): Promise<Contract[]> {
  var url = new URL(`${serverURL}/contract/owned`);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contracts);
  // return axios.get(`${serverURL}/contract/owned`, {
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.contracts);
}

// Extended nested info using groups route, requires a typeId
export function getUserContractsExt(typeId: string | number, cookie?: string): Promise<Contract[]> {
  var url = new URL(`${serverURL}/group/contract/owned`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contracts);
  // return axios.get(`${serverURL}/group/contract/owned`, {
  //   params: { typeId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.contracts);
}

export function getAsks(typeId: string | number, cookie?: string): Promise<{askPrice: number, contractId: number}[]> {
  var url = new URL(`${serverURL}/contract/type/asks`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.asks);
  // return axios.get(`${serverURL}/contract/type/asks`, {
  //   params: { typeId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.asks)
}

export function exerciseContract(contractId: string | number) {
  return axios.post(`${serverURL}/contract/exercise`, { contractId })
    .then((response) => response.data);
}

export function updateAskPrice(contractId: string | number, askPrice: number) {
  return axios.put(`${serverURL}/contract/ask`, {
    contractId,
    askPrice
  })
    .then((response) => response.data);
}

export function removeAskPrice(contractId: string | number) {
  return axios.delete(`${serverURL}/contract/ask`, {
    params: { contractId }
  })
    .then((response) => response.data);
}

// CONTRACT TYPES //

export function getContractType(typeId: string | number, cookie?: string): Promise<ContractType> {
  var url = new URL(`${serverURL}/contract/type`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contractType);
  // return axios.get(`${serverURL}/contract/type`, {
  //   params: { typeId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.contractType);
}

export function getContractTypesByAssetId(assetId: string | number, cookie?: string): Promise<ContractType[]> {
  var url = new URL(`${serverURL}/contract/type/list`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contractTypes);
  // return axios.get(`${serverURL}/contract/type/list`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.contractTypes);
}

export function getContractTypesByAssetIdExt(assetId: string | number, cookie?: string): Promise<ContractType[]> {
  var url = new URL(`${serverURL}/group/contract/type`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contractTypes);
  // return axios.get(`${serverURL}/group/contract/type`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.contractTypes);
}

export function getOwnedContractTypesByAssetIdExt(assetId: string | number, cookie?: string): Promise<ContractType[]> {
  var url = new URL(`${serverURL}/group/contract/type/owned`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contractTypes);
  // return axios.get(`${serverURL}/group/contract/type/owned`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.contractTypes);
}

// BIDS //

export function getBid(bidId: string | number, cookie?: string): Promise<Bid> {
  var url = new URL(`${serverURL}/bid`);
  url.searchParams.append('id', bidId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.bid);
  // return axios.get(`${serverURL}/bid`, {
  //    params: { id: bidId },
  //    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.bid);
}

export function getUserBids(cookie?: string): Promise<Bid[]> {
  var url = new URL(`${serverURL}/bid/owned`);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.bids);
  // return axios.get(`${serverURL}/bid/owned`, {
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.bids);
}

export function getBidsByType(typeId: string | number, cookie?: string): Promise<Bid[]> {
  var url = new URL(`${serverURL}/bid/type`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.bids);
  // return axios.get(`${serverURL}/bid/type`, {
  //   params: { typeId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.bids);
}

export function createBid(typeId: number, bidPrice: number) {
  return axios.post(`${serverURL}/bid`, {
    typeId,
    bidPrice
  })
    .then((response) => response.data);
}

export function updateBidPrice(bidId: number, bidPrice: number) {
  return axios.put(`${serverURL}/bid/price`, {
    bidId,
    bidPrice
  })
    .then((response) => response.data);
}

export function removeBid(bidId: number) {
  return axios.delete(`${serverURL}/bid`, {
    params: { bidId }
  })
    .then((response) => response.data);
}

// TRADES //

export function getLastTrade(typeId: string | number, cookie?: string): Promise<Trade> {
  var url = new URL(`${serverURL}/trade/last`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.trade);
  // return axios.get(`${serverURL}/trade/last`, {
  //   params: { typeId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.trade);
}

export function getDailyTrades(typeId: string | number, cookie?: string): Promise<Trade[]> {
  var url = new URL(`${serverURL}/trade/daily`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.trades);
  // return axios.get(`${serverURL}/trade/daily`, {
  //   params: { typeId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.trades);
}

export function getUserTrades(cookie?: string): Promise<Trade[]> {
  var url = new URL(`${serverURL}/trade/owned`);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.trades);
  // return axios.get(`${serverURL}/trade/owned`, {
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.trades);
}

export function getDailyPriceChange(typeId: string | number, cookie?: string): Promise<number> {
  var url = new URL(`${serverURL}/trade/daily/change`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.priceChange);
  // return axios.get(`${serverURL}/trade/daily/change`, {
  //   params: { typeId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.priceChange);
}

// ASSETS //

export function getAsset(assetId: string | number, cookie?: string): Promise<Asset> {
  var url = new URL(`${serverURL}/asset`);
  url.searchParams.append('id', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.asset);
  // return axios.get(`${serverURL}/asset`, {
  //   params: { id: assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.asset);
}

export function getAssetList(cookie?: string): Promise<Asset[]> {
  var url = new URL(`${serverURL}/asset/list`);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assets);
  // return axios.get(`${serverURL}/asset/list`, {
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.assets);
}

export function getAssetListExt(cookie?: string): Promise<Asset[]> {
  var url = new URL(`${serverURL}/group/asset`);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assets);
  // return axios.get(`${serverURL}/group/asset`, {
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.assets);
}

export function getAssetListOwnedExt(cookie?: string): Promise<Asset[]> {
  var url = new URL(`${serverURL}/group/asset/owned`);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assets);
  // return axios.get(`${serverURL}/group/asset/owned`, {
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.assets);
}

export function getAssetByIdExt(assetId: string | number, cookie?: string): Promise<Asset[]> {
  var url = new URL(`${serverURL}/group/asset/id`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assets);
  // return axios.get(`${serverURL}/group/asset/id`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.assets);
}

export function getAssetByIdOwnedExt(assetId: string | number, cookie?: string): Promise<Asset[]> {
  var url = new URL(`${serverURL}/group/asset/id/owned`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assets);
  // return axios.get(`${serverURL}/group/asset/id/owned`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.assets);
}

export function getAssetPrice(assetId: string | number, cookie?: string): Promise<number> {
  var url = new URL(`${serverURL}/asset/price`);
  url.searchParams.append('id', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => Number(json.price));
  // return axios.get(`${serverURL}/asset/price`, {
  //   params: { id: assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.price);
}

export function getAssetPriceHistory(
  assetId: string | number,
  days: string | number,
  cookie?: string
): Promise<{price: string | number, dataPeriod: string}[]> {
  var url = new URL(`${serverURL}/asset/price/history`);
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

export function getPool(poolId: string | number, cookie?: string): Promise<Pool> {
  var url = new URL(`${serverURL}/pool`);
  url.searchParams.append('id', poolId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.pool);
  // return axios.get(`${serverURL}/pool`, {
  //   params: { id: poolId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.pool);
}

export function getUserPools(cookie?: string): Promise<Pool[]> {
  var url = new URL(`${serverURL}/pool/owned`);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.pools);
  // return axios.get(`${serverURL}/pool/owned`, {
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.pools);
}

export function getUserPoolByAssetId(assetId: string | number, cookie?: string): Promise<Pool> {
  var url = new URL(`${serverURL}/pool/owned/asset`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.pool);
  // return axios.get(`${serverURL}/pool/owned/asset`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.pool);
}

export function getUserPoolByAssetIdExt(assetId: string | number, cookie?: string): Promise<Pool> {
  var url = new URL(`${serverURL}/group/pool/owned`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.pool);
  // return axios.get(`${serverURL}/group/pool/owned`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.pool);
}

export function getPoolsByAssetId(assetId: string | number, cookie?: string): Promise<Pool[]> {
  var url = new URL(`${serverURL}/pool/list`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.pools);
  // return axios.get(`${serverURL}/pool/list`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.pools);
}

export function getPoolsByAssetIdExt(assetId: string | number, cookie?: string): Promise<Pool[]> {
  var url = new URL(`${serverURL}/group/pool`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.pools);
  // return axios.get(`${serverURL}/group/pool`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.pools);
}

export function getPoolAssetAmountByAssetId(assetId: string | number, cookie?: string): Promise<number> {
  var url = new URL(`${serverURL}/pool/asset`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assetAmount);
  // return axios.get(`${serverURL}/pool/asset`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.assetAmount);
}

export function getPoolLocksByPoolId(poolId: string | number, cookie?: string): Promise<PoolLock[]> {
  var url = new URL(`${serverURL}/pool/lock`);
  url.searchParams.append('id', poolId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.poolLocks);
  // return axios.get(`${serverURL}/pool/lock`, {
  //   params: { id: poolId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.poolLocks);
}

export function getPoolLockAssetAmountByAssetId(assetId: string | number, cookie?: string): Promise<number> {
  var url = new URL(`${serverURL}/pool/lock/asset`);
  url.searchParams.append('assetId', assetId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assetAmount);
  // return axios.get(`${serverURL}/pool/lock/asset`, {
  //   params: { assetId },
  //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  // })
  //   .then((response) => response.data.assetAmount);
}

export function createPool(assetId: number, assetAmount=0) {
  return axios.post(`${serverURL}/pool`, {
    assetId,
    assetAmount
  })
    .then((response) => response.data);
}

export function depositPoolAssets(poolId: number, assetAmount: number) {
  return axios.post(`${serverURL}/pool/asset/deposit`, {
    poolId,
    assetAmount
  })
    .then((response) => response.data);
}

export function withdrawPoolAssets(poolId: number, assetAmount: number) {
  return axios.post(`${serverURL}/pool/asset/withdraw`, {
    poolId,
    assetAmount
  })
    .then((response) => response.data);
}

export function withdrawPoolFees(poolId: number, feeAmount: number) {
  return axios.post(`${serverURL}/pool/fees/withdraw`, {
    poolId,
    feeAmount
  })
    .then((response) => response.data);
}
