import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { Asset } from '../../lib/types';
import { serverURL } from '../../config';

// import AssetDetails from './AssetDetails';

import { Link, Outlet } from 'react-router-dom';

export default function AssetList(props: any) {

  const [error, setError] = useState('');
  const [assetList, setAssetList] = useState<Asset[]>([]);

  useEffect(() => {
    axios.get(`${serverURL}/asset/list`)
    .then((response) => {
      setAssetList(response.data.assets);
    })
    .catch((errorRes) => {
      console.log(errorRes);
      if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
        setError(errorRes.response.data.message);
      } else {
        setError(errorRes.message);
      }
    });
  }, []);

  const renderAssets = assetList.map((asset) => {
    return (
      <Link to={asset.assetId.toString()} key={asset.assetId}>
        {asset.name}
      </Link>
    );
  });

  return (
    <div className="asset-list">
      <h2>Assets</h2>
      {error && <div className='error-message'>{`Error: ${error}`}</div>}
      {renderAssets}
      <Outlet />
    </div>

  );
};
