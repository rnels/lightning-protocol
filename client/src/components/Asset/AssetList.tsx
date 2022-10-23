import { useState } from 'react';
import axios from '../../lib/axios';
import { Asset } from '../../lib/types';
import { serverURL } from '../../config';

import AssetDetails from './AssetDetails';

export default function AssetList(props: any) {

  const [error, setError] = useState('');
  const [assetList, setAssetList] = useState<Asset[]>([]);

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

    return (
      <div className="asset-list">
        {error && <div className='error-message'>{`Error: ${error}`}</div>}
        {assetList.length > 0 &&
          assetList.map((asset) =>
            <AssetDetails
              asset={asset}
              key={asset.assetId}
            />
          )
        }
      </div>

    );
};
