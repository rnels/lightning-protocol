import axios from './axios';
import { serverURL } from '../config';
import { Asset, Bid, Contract, ContractType, Pool, Trade } from './types';

// CONTRACTS //

export function getContractList(typeId: string | number): Promise<Contract[]> {
  return axios.get(`${serverURL}/contract/list`, {
    params: {
      typeId
    }
  })
    .then((response) => response.data.contracts)
}

export function getAsks(typeId: string | number): Promise<{askPrice: number, contractId: number}[]> {
  return axios.get(`${serverURL}/contract/type/asks`, {
    params: {
      typeId
    }
  })
    .then((response) => response.data.asks)
}

// CONTRACT TYPES //

export function getContractTypesByAssetId(assetId: string | number): Promise<ContractType[]> {
  return axios.get(`${serverURL}/contract/type/list`, {
    params: {
      assetId
    }
  })
    .then((response) => response.data.contractTypes);
}

// BIDS //

export function getBids(typeId: string | number): Promise<Bid[]> {
  return axios.get(`${serverURL}/bid/type`, {
    params: {
      typeId
    }
  })
    .then((response) => response.data.bids);
}

export function createBid(typeId: number, bidPrice: number) {
  return axios.post(`${serverURL}/bid`, {
    typeId,
    bidPrice
  })
    .then((response) => response.data);
}

// TRADES //

export function getLastTrade(typeId: string | number): Promise<Trade> {
  return axios.get(`${serverURL}/trade/last`, {
    params: {
      typeId
    }
  })
    .then((response) => response.data.trade);
}

export function getDailyTrades(typeId: string | number): Promise<Trade[]> {
  return axios.get(`${serverURL}/trade/daily`, {
    params: {
      typeId
    }
  })
    .then((response) => response.data.trades);
}

export function getDailyPriceChange(typeId: string | number): Promise<number> {
  return axios.get(`${serverURL}/trade/daily/change`, {
    params: {
      typeId
    }
  })
    .then((response) => response.data.priceChange);
}

// ASSETS //

export function getAsset(assetId: string | number): Promise<Asset> {
  return axios.get(`${serverURL}/asset`, {
    params: {
      id: assetId
    }
  })
    .then((response) => response.data.asset);
}

export function getAssetPrice(assetId: string | number): Promise<number> {
  return axios.get(`${serverURL}/asset/price`, {
    params: {
      id: assetId
    }
  })
    .then((response) => response.data.price);
}

// POOLS //

export function getPool(poolId: string | number): Promise<Pool> {
  return axios.get(`${serverURL}/pool`, {
    params: {
      id: poolId
    }
  })
    .then((response) => response.data.pool);
}

export function getUserPools(): Promise<Pool[]> {
  return axios.get(`${serverURL}/pool/owned`)
    .then((response) => response.data.pools);;
}

export function getPoolsByAssetId(assetId: string | number): Promise<Pool[]> {
  return axios.get(`${serverURL}/pool/list`, {
    params: {
      assetId
    }
  })
    .then((response) => response.data.pools);
}

export function getPoolAssetAmountByAssetId(assetId: string | number): Promise<number> {
  return axios.get(`${serverURL}/pool/asset`, {
    params: {
      assetId
    }
  })
    .then((response) => response.data.assetAmount);
}

export function getPoolLockAssetAmountByAssetId(assetId: string | number): Promise<number> {
  return axios.get(`${serverURL}/pool/lock/asset`, {
    params: {
      assetId
    }
  })
    .then((response) => response.data.assetAmount);
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