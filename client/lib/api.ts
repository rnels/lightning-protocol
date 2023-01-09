import axios from './axios';
import { serverURL } from '../config';
import { Account, Asset, Bid, Contract, ContractType, Pool, PoolLock, Trade } from './types';

// ACCOUNTS //

// export function getAccount(cookie: string) : Promise<Account> | Account {
//   var url = new URL(`${serverURL}/user/account`);
//   return fetch(url, {
//     method: 'GET',
//     headers: { Cookie: `lightning-app-cookie=${cookie}` },
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.account);
// }

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

// export function getContract(contractId: string | number, cookie?: string): Promise<Contract> {
//   var url = new URL(`${serverURL}/user/contract`);
//   url.searchParams.append('id', contractId as string);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.contract);
//   // return axios.get(`${serverURL}/contract`, {
//   //   params: { id: contractId },
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.contract)
// }

// // Get trades along with contract info (requires ownership)
// export function getContractExt(contractId: string | number, cookie?: string): Promise<Contract> {
//   var url = new URL(`${serverURL}/user/contract/ext`);
//   url.searchParams.append('id', contractId as string);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.contract);
// }

export function getContractListByType(typeId: string | number, cookie?: string): Promise<Contract[]> {
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
export function getContractListByTypeExt(typeId: string | number, cookie?: string): Promise<Contract[]> {
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

// export function getUserContracts(cookie?: string): Promise<Contract[]> {
//   var url = new URL(`${serverURL}/user/contract/list`);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.contracts);
//   // return axios.get(`${serverURL}/contract/list`, {
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.contracts);
// }

// Extended nested info using groups route, requires a typeId
// export function getUserContractsExt(typeId: string | number, cookie?: string): Promise<Contract[]> {
//   var url = new URL(`${serverURL}/group/contract/list`);
//   url.searchParams.append('typeId', typeId as string);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.contracts);
//   // return axios.get(`${serverURL}/group/contract/list`, {
//   //   params: { typeId },
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.contracts);
// }

export function getAsks(typeId: string | number, cookie?: string): Promise<{askPrice: string | number, contractId: number}[]> {
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

export function getContractType(typeId: string | number, cookie?: string): Promise<ContractType> {
  var url = new URL(`${serverURL}/client/contract/type`);
  url.searchParams.append('typeId', typeId as string);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.contractType);
}

// NOTE: Only gets active contractTypes
export function getContractTypesByAssetId(assetId: string | number, cookie?: string): Promise<ContractType[]> {
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

export function getTopBadgedContractTypes(assetId: string | number, direction: boolean, cookie?: string): Promise<ContractType[]> {
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

export function getFeaturedContractTypes(assetId: string | number, direction: boolean, cookie?: string): Promise<ContractType[]> {
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

export function getContractTypesByAssetIdExt(assetId: string | number, cookie?: string): Promise<ContractType[]> {
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

// export function getOwnedContractTypesByAssetIdExt(assetId: string | number, cookie?: string): Promise<ContractType[]> {
//   var url = new URL(`${serverURL}/user/group/contract/type/list`);
//   url.searchParams.append('assetId', assetId as string);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.contractTypes);
//   // return axios.get(`${serverURL}/group/contract/type/list`, {
//   //   params: { assetId },
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.contractTypes);
// }

// BIDS //

// export function getBid(bidId: string | number, cookie?: string): Promise<Bid> {
//   var url = new URL(`${serverURL}/user/bid`);
//   url.searchParams.append('id', bidId as string);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.bid);
//   // return axios.get(`${serverURL}/bid`, {
//   //    params: { id: bidId },
//   //    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.bid);
// }

// export function getUserBids(cookie?: string): Promise<Bid[]> {
//   var url = new URL(`${serverURL}/user/bid/list`);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.bids);
//   // return axios.get(`${serverURL}/bid/list`, {
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.bids);
// }

export function getBidsByType(typeId: string | number, cookie?: string): Promise<Bid[]> {
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

export function getLastTrade(typeId: string | number, cookie?: string): Promise<Trade> {
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

export function getDailyTrades(typeId: string | number, cookie?: string): Promise<Trade[]> {
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

// export function getUserTrades(cookie?: string): Promise<Trade[]> {
//   var url = new URL(`${serverURL}/user/trade/list`);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.trades);
//   // return axios.get(`${serverURL}/user/trade/list`, {
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.trades);
// }

export function getDailyPriceChange(typeId: string | number, cookie?: string): Promise<number> {
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

export function getAsset(assetId: string | number, cookie?: string): Promise<Asset> {
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

export function getAssetList(cookie?: string): Promise<Asset[]> {
  var url = new URL(`${serverURL}/client/asset/list`);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assets);
}

export function getAssetListExt(cookie?: string): Promise<Asset[]> {
  var url = new URL(`${serverURL}/client/group/asset`);
  return fetch(url, {
    method: 'GET',
    headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
    credentials: 'include'
  })
    .then((result) => result.json())
    .then((json) => json.assets);
}

// export function getAssetListOwnedExt(cookie?: string): Promise<Asset[]> {
//   var url = new URL(`${serverURL}/user/group/asset/list`);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.assets);
//   // return axios.get(`${serverURL}/user/group/asset/list`, {
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.assets);
// }

export function getAssetByIdExt(assetId: string | number, cookie?: string): Promise<Asset[]> {
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

// export function getAssetByIdOwnedExt(assetId: string | number, cookie?: string): Promise<Asset[]> {
//   var url = new URL(`${serverURL}/user/group/asset/id/list`);
//   url.searchParams.append('assetId', assetId as string);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.assets);
//   // return axios.get(`${serverURL}/user/group/asset/id/list`, {
//   //   params: { assetId },
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.assets);
// }

export function getAssetPrice(assetId: string | number, cookie?: string): Promise<number> {
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
  days: string | number,
  cookie?: string
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

// export function getPool(poolId: string | number, cookie?: string): Promise<Pool> {
//   var url = new URL(`${serverURL}/user/pool`);
//   url.searchParams.append('id', poolId as string);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.pool);
//   // return axios.get(`${serverURL}/user/pool`, {
//   //   params: { id: poolId },
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.pool);
// }

// export function getUserPools(cookie?: string): Promise<Pool[]> {
//   var url = new URL(`${serverURL}/user/pool/list`);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.pools);
//   // return axios.get(`${serverURL}/user/pool/list`, {
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.pools);
// }

// export function getUserPoolByAssetId(assetId: string | number, cookie?: string): Promise<Pool> {
//   var url = new URL(`${serverURL}/user/pool/list/asset`);
//   url.searchParams.append('assetId', assetId as string);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.pool);
//   // return axios.get(`${serverURL}/user/pool/list/asset`, {
//   //   params: { assetId },
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.pool);
// }

// export function getUserPoolByAssetIdExt(assetId: string | number, cookie?: string): Promise<Pool> {
//   var url = new URL(`${serverURL}/user/group/pool/list`);
//   url.searchParams.append('assetId', assetId as string);
//   return fetch(url, {
//     method: 'GET',
//     headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {},
//     credentials: 'include'
//   })
//     .then((result) => result.json())
//     .then((json) => json.pool);
//   // return axios.get(`${serverURL}/user/group/pool/list`, {
//   //   params: { assetId },
//   //   headers: cookie ? { Cookie: `lightning-app-cookie=${cookie}` } : {}
//   // })
//   //   .then((response) => response.data.pool);
// }

export function getPoolsByAssetId(assetId: string | number, cookie?: string): Promise<Pool[]> {
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

export function getPoolsByAssetIdExt(assetId: string | number, cookie?: string): Promise<Pool[]> {
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

export function getPoolAssetAmountByAssetId(assetId: string | number, cookie?: string): Promise<number> {
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

export function getPoolLocksByPoolId(poolId: string | number, cookie?: string): Promise<PoolLock[]> {
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

export function getPoolLockAssetAmountByAssetId(assetId: string | number, cookie?: string): Promise<number> {
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
