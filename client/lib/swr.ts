import axios from './axios';
import useSWR from 'swr';
import { serverURL } from '../config';
import { Account, Asset, Bid, Contract, ContractType, Pool, PoolLock, Trade } from './types';

// ASSETS //

export function getAssetListOwnedExt() {
  let fetchUrl = new URL(`${serverURL}/group/asset/owned`);
  let fetcher = (url: string) =>
    axios.get(url)
      .then((response) => response.data.assets as Asset[]);
  let url = fetchUrl.toString();
  let options = { // When navigating away and back to the page
    revalidateIfStale: true,
    revalidateOnFocus: true
  }
  const { data, error, mutate } = useSWR(url, fetcher, options);
  return {
    assets: error ? undefined : data,
    error,
    updateAssetListOwnedExt: mutate.bind(mutate, data)
  };
}

// ACCOUNTS //

export function getAccount() {
  let fetchUrl = new URL(`${serverURL}/account`);
  let fetcher = (url: string) =>
    axios.get(url)
      .then((response) => response.data.account as Account);
  let url = fetchUrl.toString();
  let options = {
    revalidateIfStale: false,
    revalidateOnFocus: false
  }
  const { data, error, mutate } = useSWR(url, fetcher, options);
  return {
    account: error ? null : data, // Returns null if there's an error, undefined if it's still loading
    error,
    updateAccount: mutate.bind(mutate, data)
  };
}

// CONTRACTS //

export function getContract(contractId: string | number, initialData?: Contract) {
  var fetchUrl = new URL(`${serverURL}/contract/ext`);
  fetchUrl.searchParams.append('id', contractId as string);
  let fetcher = (url: string) =>
    axios.get(url)
      .then((response) => response.data.contract as Contract);
  let url = fetchUrl.toString();
  let options = {
    ...(initialData && {fallbackData: initialData})
  }
  const { data, error, mutate } = useSWR(initialData ? null : url, fetcher, options);
  return {
    contract: error ? undefined : data,
    error,
    updateContract: mutate.bind(mutate, data)
  };
}

// BIDS //

export function getBid(bidId: string | number, initialData?: Bid){
  var fetchUrl = new URL(`${serverURL}/bid`);
  fetchUrl.searchParams.append('id', bidId as string);
  let fetcher = (url: string) =>
    axios.get(url)
      .then((response) => response.data.bid as Bid);
  let url = fetchUrl.toString();
  let options = {
    ...(initialData && {fallbackData: initialData})
  }
  const { data, error, mutate } = useSWR(initialData ? null : url, fetcher, options);
  return {
    bid: error ? undefined : data,
    error,
    updateBid: mutate.bind(mutate, data)
  };
}

// POOLS //

export function getPool(poolId: string | number, initialData?: Pool) {
  var fetchUrl = new URL(`${serverURL}/pool`);
  fetchUrl.searchParams.append('id', poolId as string);
  let fetcher = (url: string) =>
    axios.get(url)
      .then((response) => response.data.pool as Pool);
  let url = fetchUrl.toString();
  let options = {
    ...(initialData && {fallbackData: initialData})
  }
  const { data, error, mutate } = useSWR(initialData ? null : url, fetcher, options);
  return {
    pool: error ? undefined : data,
    error,
    updatePool: mutate.bind(mutate, data)
  };
}
