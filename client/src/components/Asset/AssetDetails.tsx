import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { Asset } from '../../lib/types';
import { serverURL } from '../../config';

// import AssetPoolList from "../Pool/AssetPoolList";
import AssetName from "./AssetName";
import AssetPrice from "./AssetPrice";
import AssetSymbol from "./AssetSymbol";

import {
  Link,
  useParams,
  Outlet
} from "react-router-dom";
// import ContractTypeStrikePrice from '../Contract/ContractType/ContractTypeStrikePrice';
// import ContractTypeDetails from '../Contract/ContractType/ContractTypeDetails';
// import ContractTypeList from '../Contract/ContractType/ContractTypeList';

export default function AssetDetails() {

  const [asset, setAsset] = useState<Asset>();
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
  }, [assetId]);

  if (!asset) return null;

  // createRoutesFromElements(
  //   <Route
  //     path='pools'
  //     element={
  //       <AssetPoolList
  //         assetId={props.asset.assetId}
  //       />
  //     }
  //   />
  // );

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
        assetName={asset.name}
      />
      <AssetSymbol
        assetSymbol={asset.symbol}
      />
      <AssetPrice
        assetId={asset.assetId}
      />
      <Link to={`/assets/${assetId}/pools`}>
        Pools
      </Link>
      <Link to={`/assets/${assetId}/contracts`}>
        Contract Types
      </Link>
      <Outlet />
    </div>

  );
};
