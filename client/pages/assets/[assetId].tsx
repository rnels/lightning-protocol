import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import React from 'react';

import { ContractType, Asset } from '../../lib/types';
import * as api from '../../lib/api';
import ContractTypesTable from '../../components/Views/ContractTypesTable';

export default function AssetContracts() {

  const router = useRouter();
  const { assetId } = router.query;

  const [asset, setAsset] = useState<Asset>();
  const [assetPrice, setAssetPrice] = useState<number>();
  const [poolAssetAmount, setPoolAssetAmount] = useState<number>();
  const [poolLockAssetAmount, setPoolLockAssetAmount] = useState<number>();
  const [contractTypeList, setContractTypeList] = useState<ContractType[]>([]);
  const [directionFilter, setDirectionFilter] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<Date>();
  const [dateFilterList, setDateFilterList] = useState<string[]>([]);

  useEffect(() => {
    if (!assetId) return;
    api.getAsset(assetId as string)
      .then((asset) => setAsset(asset))
      .catch((err) => console.log(err));
    api.getAssetPrice(assetId as string)
      .then((price) => setAssetPrice(price))
      .catch((err) => console.log(err));
    api.getPoolAssetAmountByAssetId(assetId as string)
      .then((assetAmount) => setPoolAssetAmount(assetAmount))
      .catch((err) => console.log(err));
    api.getPoolLockAssetAmountByAssetId(assetId as string)
      .then((assetAmount) => setPoolLockAssetAmount(assetAmount))
      .catch((err) => console.log(err));
    api.getContractTypesByAssetId(assetId as string)
      .then((contractTypes) => {
        setContractTypeList(contractTypes);
        setDateFilter(contractTypes[0].expiresAt);
        setDateFilterList(
          contractTypes
            .map((contractType) => contractType.expiresAt.toString())
            .filter((expiry: string, i: number, expiryArray: string[]) => expiryArray.indexOf(expiry) === i)
        );
      })
      .catch((err) => console.log(err));
  }, [assetId]);

  if (!assetId || !asset || !assetPrice) {
    return null; // TODO: Change this to render some info
  }

  const filteredTypeList = contractTypeList
    .filter((contractType => contractType.expiresAt === dateFilter && contractType.direction === directionFilter))
    .sort((a, b) => a.strikePrice - b.strikePrice);

    return (
      <div className="asset-contracts-view">
        <h2 className='asset-contracts-view-header'>{`${asset.name} ($${asset.symbol})`}</h2>
        <div>{`Price: $${assetPrice >= 1 ? assetPrice.toFixed(2) : assetPrice.toFixed(4)}`}</div>
        <div>{`Contract Amount: ${asset.assetAmount} ${asset.symbol}`}</div>
        <div>
          {`Pooled: ${poolAssetAmount || 0} ${asset.symbol}
            (${(poolAssetAmount && poolLockAssetAmount) ? Math.floor(100 * (poolLockAssetAmount / poolAssetAmount)) : 0}% Backing)
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
              value={dateFilter?.toString()}
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
          asset={asset}
        />
      </div>

    );
};