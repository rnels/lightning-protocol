import React from 'react';

import { Asset } from '../../lib/types';
import AssetName from "./AssetName";
import AssetPrice from "./AssetPrice";
import AssetSymbol from "./AssetSymbol";
import AssetAmount from "./AssetAmount";
import Link from 'next/link';

// import ContractTypeStrikePrice from '../Contract/ContractType/ContractTypeStrikePrice';
// import ContractTypeDetails from '../Contract/ContractType/ContractTypeDetails';
// import ContractTypeList from '../Contract/ContractType/ContractTypeList';

// TODO: Use this somewhere
export default function AssetDetails(props: {asset: Asset}) {

  return (
    <div className='asset-details'>
      {props.asset.iconUrl &&
        <img
          src={props.asset.iconUrl}
          alt={`${props.asset.name}-icon`}
          height='100'
          width='100'
        />
      }
      <AssetName
        name={props.asset.name}
      />
      <AssetSymbol
        symbol={props.asset.symbol}
      />
      <AssetAmount
        amount={props.asset.assetAmount}
      />
      <AssetPrice
        assetId={props.asset.assetId}
      />
      <Link href={`/assets/${props.asset.assetId}/pools`}>
        Pools
      </Link>
      <Link href={`/assets/${props.asset.assetId}/contracts`}>
        Contract Types
      </Link>
    </div>
  );

};
