import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { ContractType, Asset } from '../../lib/types';
import { serverURL } from '../../config';

import { useParams } from 'react-router-dom';
import ContractTypesTable from './ContractTypesTable';

/** Renders a list of contracts for the given contracttypeId */
export default function AssetContractsView() {

  const [asset, setAsset] = useState<Asset>();
  const [assetPrice, setAssetPrice] = useState<number>();
  const [poolAssetAmount, setPoolAssetAmount] = useState<number>();
  const [poolLockAssetAmount, setPoolLockAssetAmount] = useState<number>();
  const [contractTypeList, setContractTypeList] = useState<ContractType[]>([]);
  const [directionFilter, setDirectionFilter] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<string>();
  const [dateFilterList, setDateFilterList] = useState<string[]>([]);

  const { assetId } = useParams();

  useEffect(() => {
    axios.get(`${serverURL}/asset`, {
      params: {
        id: assetId
      }
    })
      .then((response) => {
        setAsset(response.data.asset);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
    axios.get(`${serverURL}/asset/price`, {
      params: {
        id: assetId
      }
    })
      .then((response) => {
        setAssetPrice(response.data.asset.price);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
    axios.get(`${serverURL}/pool/asset`, {
      params: {
        assetId
      }
    })
      .then((response) => {
        setPoolAssetAmount(response.data.assetAmount);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
    axios.get(`${serverURL}/pool/lock/asset`, {
      params: {
        assetId
      }
    })
      .then((response) => {
        setPoolLockAssetAmount(response.data.assetAmount);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
    axios.get(`${serverURL}/contract/type/list`, {
      params: {
        assetId
      }
    })
      .then((response) => {
        setContractTypeList(response.data.contractTypes);
        setDateFilter(response.data.contractTypes[0].expiresAt);
        setDateFilterList(
          response.data.contractTypes
          .map((contractType: ContractType) => contractType.expiresAt)
          .filter((expiry: string, i: number, expiryArray: string[]) => expiryArray.indexOf(expiry) === i)
        );
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
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
        <div>
          {`Pooled: ${poolAssetAmount || 0} ${asset.symbol}
            (${(poolAssetAmount && poolLockAssetAmount) ? 100 * (poolLockAssetAmount / poolAssetAmount) : 0}% Backing)
          `}
        </div>
        <form
          className='asset-contracts-filters'
          onSubmit={(e) => e.preventDefault()}
        >
          <label className='asset-contracts-filter-expiry'>
            Expiry
            <select
              onChange={(e) => setDateFilter(e.target.value)}
              value={dateFilter}
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
        />
      </div>

    );
};
