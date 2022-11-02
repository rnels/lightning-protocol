import * as api from '../../lib/api';
import { Asset } from '../../lib/types';
// import AssetDetails from './AssetDetails';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AssetList(props: any) {

  const [error, setError] = useState('');
  const [assetList, setAssetList] = useState<Asset[]>([]);

  useEffect(() => {
    api.getAssetList()
      .then((assets) => setAssetList(assets))
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
    </div>

  );
};
