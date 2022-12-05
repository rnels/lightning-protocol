import axios from './axios';
import { serverURL } from '../config';
import { Account, Asset, Bid, Contract, ContractType, Pool, PoolLock, Trade } from './types';

// ACCOUNTS //

export function getAccount() {
  let fetchUrl = new URL(`${serverURL}/account`);
  let fetcher = (url: string) =>
    axios.get(url)
      .then((response) => response.data.account as Account);
  let url = fetchUrl.toString();
  return { url, fetcher };
}

// CONTRACTS //

// TODO: Ensure that the URL having these parameters works with useSWR
export function getContract(contractId: string | number) {
  var fetchUrl = new URL(`${serverURL}/contract`);
  fetchUrl.searchParams.append('id', contractId as string);
  let fetcher = (url: string) =>
    axios.get(url)
      .then((response) => response.data.contract as Contract);
  let url = fetchUrl.toString();
  return { url, fetcher };
}

// ASSETS //

export function getAssetListOwnedExt() {
  let fetchUrl = new URL(`${serverURL}/group/asset/owned`);
  let fetcher = (url: string) =>
    axios.get(url)
      .then((response) => response.data.assets as Asset[]);
  let url = fetchUrl.toString();
  let options = {
    revalidateIfStale: false,
    revalidateOnFocus: false
  }
  return { url, fetcher, options };
}