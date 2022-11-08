import { useEffect, useState } from 'react';
import { Router, useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import React from 'react';

import { ContractType, Asset } from '../../lib/types';
import * as api from '../../lib/api';
import ContractTypesTable from '../../components/Views/ContractTypesTable';

export default function AssetContracts(
  props: {
    asset: Asset,
    assetPrice: number,
    poolAssetAmount: number,
    poolLockAssetAmount: number,
    contractTypeList: ContractType[]
  }
) {

  const [directionFilter, setDirectionFilter] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<Date>(props.contractTypeList[0].expiresAt);
  const dateFilterList = props.contractTypeList
    .map((contractType) => contractType.expiresAt.toString())
    .filter((expiry: string, i: number, expiryArray: string[]) => expiryArray.indexOf(expiry) === i);

  const filteredTypeList = props.contractTypeList
    .filter((contractType => contractType.expiresAt === dateFilter && contractType.direction === directionFilter))
    .sort((a, b) => a.strikePrice - b.strikePrice);

  const [amountFilter, setAmountFilter] = useState<boolean>(false);

    return (
      <div className='asset-contracts-view'>
        <h2 className='asset-contracts-view-header'>{`${props.asset.name} ($${props.asset.symbol})`}</h2>
        <div>{`Price: $${props.assetPrice >= 1 ? props.assetPrice.toFixed(2) : props.assetPrice.toFixed(4)}`}</div>
        <div>{`Contract Amount: ${props.asset.assetAmount} ${props.asset.symbol}`}</div>
        <div>
          {`Pooled: ${props.poolAssetAmount || 0} ${props.asset.symbol}
            (${(props.poolAssetAmount && props.poolLockAssetAmount) ? Math.floor(100 * (props.poolLockAssetAmount / props.poolAssetAmount)) : 0}% Backing)
          `}
        </div>
        <form
          className='asset-contracts-filters'
          onSubmit={(e) => e.preventDefault()}
        >
          <label className='asset-contracts-filter-expiry'>
            Expiry
            <select
              onChange={(e) => setDateFilter(new Date(e.target.value))}
              value={dateFilter.toString()}
            >
              {dateFilterList.map((filter) =>
                <option
                  key={filter}
                  value={filter}
                >
                  {filter}
                </option>
              )}
            </select>
          </label>
          <button
              onClick={() => setAmountFilter(!amountFilter)}
          >{amountFilter ? 'Show Price' : 'Show Cost'}</button>
          <div className='asset-contracts-filter-direction'>
            <button
              onClick={() => setDirectionFilter(true)}
            >Calls</button>
            <button
              onClick={() => setDirectionFilter(false)}
            >Puts</button>
          </div>
        </form>
        <ContractTypesTable
          contractTypes={filteredTypeList}
          asset={props.asset}
          amountFilter={amountFilter}
        />
      </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { assetId } = context.query;

  let cookie = context.req.cookies['lightning-app-cookie'];

  let asset: Asset;
  let assetPrice: number;
  let poolAssetAmount: number;
  let poolLockAssetAmount: number;
  let contractTypeList: ContractType[];

  try {
    asset = await api.getAsset(assetId as string, cookie);
    assetPrice = await api.getAssetPrice(assetId as string, cookie);
    poolAssetAmount = await api.getPoolAssetAmountByAssetId(assetId as string, cookie);
    poolLockAssetAmount = await api.getPoolLockAssetAmountByAssetId(assetId as string, cookie);
    contractTypeList = await api.getContractTypesByAssetId(assetId as string, cookie);
    return {
      props: {
        asset,
        assetPrice,
        poolAssetAmount,
        poolLockAssetAmount,
        contractTypeList
      }
    }
  } catch (e) {
    return {
      props: {}
    };
  }

};
