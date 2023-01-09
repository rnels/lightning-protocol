import axios from './axios';
import { serverURL } from '../config';
import { Asset, Bid, Contract, ContractType, Pool, Trade } from './types';

// ACCOUNTS //

export function registerAccount(email: string, password: string, firstName: string, lastName: string) {
  return axios.post(`${serverURL}/user/register`, {
    firstName,
    lastName,
    email,
    password
  })
    .then((response) => response.data);
}

export function loginAccount(email: string, password: string) {
  return axios.post(`${serverURL}/user/login`, {
    email,
    password
  })
    .then((response) => response.data);
}

export function logoutAccount() {
  return axios.post(`${serverURL}/user/logout`)
    .then((response) => response.data);
}

export function depositPaper(amount: number) {
  return axios.post(`${serverURL}/user/account/paper`, { amount })
    .then((response) => response.data);
}

// CONTRACTS //

export function getUserContracts(cookie?: string): Promise<Contract[]> {
  return axios.get(`${serverURL}/user/contract/list`, {
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  })
    .then((response) => response.data.contracts as Contract[]);
}

// Extended nested info using groups route, requires a typeId
export function getUserContractsExt(typeId: string | number, cookie?: string): Promise<Contract[]> {
  return axios.get(`${serverURL}/user/group/contract`, {
    params: { typeId },
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  })
    .then((response) => response.data.contracts as Contract[]);
}

export function exerciseContract(contractId: string | number) {
  return axios.post(`${serverURL}/user/contract/exercise`, { contractId })
    .then((response) => response.data);
}

export function updateAskPrice(contractId: string | number, askPrice: number) {
  return axios.put(`${serverURL}/user/contract/ask`, {
    contractId,
    askPrice
  })
    .then((response) => response.data);
}

export function removeAskPrice(contractId: string | number) {
  return axios.delete(`${serverURL}/user/contract/ask`, {
    params: { contractId }
  })
    .then((response) => response.data);
}

// CONTRACT TYPES //

export function getUserContractTypesByAssetIdExt(assetId: string | number, cookie?: string): Promise<ContractType[]> {
  return axios.get(`${serverURL}/user/group/contract/type`, {
    params: { assetId },
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  })
    .then((response) => response.data.contractTypes as ContractType[]);
}

// BIDS //

export function getUserBids(cookie?: string): Promise<Bid[]> {
  return axios.get(`${serverURL}/user/bid/list`, {
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  })
    .then((response) => response.data.bids as Bid[]);
}

export function createBids(typeId: number, bidPrice: number, amount=1) {
  return axios.post(`${serverURL}/user/bid`, {
    typeId,
    bidPrice,
    amount
  })
    .then((response) => response.data);
}

export function updateBidPrice(bidId: number, bidPrice: number) {
  return axios.put(`${serverURL}/user/bid/price`, {
    bidId,
    bidPrice
  })
    .then((response) => response.data);
}

export function removeBid(bidId: number) {
  return axios.delete(`${serverURL}/user/bid`, {
    params: { bidId }
  })
    .then((response) => response.data);
}

// TRADES //

export function getUserTrades(cookie?: string): Promise<Trade[]> {
  return axios.get(`${serverURL}/user/trade/list`, {
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  })
    .then((response) => response.data.trades as Trade[]);
}

// ASSETS //

export function getAssetByIdOwnedExt(assetId: string | number, cookie?: string): Promise<Asset[]> {
  return axios.get(`${serverURL}/user/group/asset/id`, {
    params: { assetId },
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  })
    .then((response) => response.data.assets as Asset[]);
}

// POOLS //

export function getUserPools(cookie?: string): Promise<Pool[]> {
  return axios.get(`${serverURL}/user/pool/list`, {
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  })
    .then((response) => response.data.pools as Pool[]);
}

export function getUserPoolByAssetId(assetId: string | number, cookie?: string): Promise<Pool> {
  return axios.get(`${serverURL}/user/pool/list/asset`, {
    params: { assetId },
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  })
    .then((response) => response.data.pool as Pool);
}

export function getUserPoolByAssetIdExt(assetId: string | number, cookie?: string): Promise<Pool> {
  return axios.get(`${serverURL}/user/group/pool`, {
    params: { assetId },
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
  })
    .then((response) => response.data.pool as Pool);
}

export function createPool(assetId: number, assetAmount=0) {
  return axios.post(`${serverURL}/user/pool`, {
    assetId,
    assetAmount
  })
    .then((response) => response.data);
}

export function buyPoolAssets(poolId: number, assetAmount: number) {
  return axios.post(`${serverURL}/user/pool/asset/buy`, {
    poolId,
    assetAmount
  })
    .then((response) => response.data);
}

export function sellPoolAssets(poolId: number, assetAmount: number) {
  return axios.post(`${serverURL}/user/pool/asset/sell`, {
    poolId,
    assetAmount
  })
    .then((response) => response.data);
}
