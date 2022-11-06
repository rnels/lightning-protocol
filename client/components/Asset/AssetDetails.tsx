import { useEffect, useState } from 'react';
import React from 'react';

import * as api from '../../lib/api';
import { Asset } from '../../lib/types';
// import AssetPoolList from "../Pool/AssetPoolList";
import AssetName from "./AssetName";
import AssetPrice from "./AssetPrice";
import AssetSymbol from "./AssetSymbol";
import AssetAmount from "./AssetAmount";

// import ContractTypeStrikePrice from '../Contract/ContractType/ContractTypeStrikePrice';
// import ContractTypeDetails from '../Contract/ContractType/ContractTypeDetails';
// import ContractTypeList from '../Contract/ContractType/ContractTypeList';

export default function AssetDetails(props: {assetId: string | number}) {

  const [asset, setAsset] = useState<Asset>();

  useEffect(() => {
    if (!props.assetId) return;
    api.getAsset(props.assetId)
    .then((asset) => setAsset(asset))
    .catch((errorRes) => {
      console.log(errorRes);
    });
  }, [props.assetId]);

  if (!asset) return null;

  return (
    <div className='asset-details'>
      {asset.iconUrl &&
        <img
          src={asset.iconUrl}
          alt={`${asset.name}-icon`}
          height='100'
          width='100'
        />
      }
      <AssetName
        name={asset.name}
      />
      <AssetSymbol
        symbol={asset.symbol}
      />
      <AssetAmount
        amount={asset.assetAmount}
      />
      <AssetPrice
        assetId={asset.assetId}
      />
      <a href={`/assets/${asset.assetId}/pools`}>
        Pools
      </a>
      <a href={`/assets/${asset.assetId}/contracts`}>
        Contract Types
      </a>
    </div>

  );
};
