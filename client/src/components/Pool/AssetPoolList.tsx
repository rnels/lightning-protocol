import { useState } from 'react';
import axios from '../../lib/axios';
import { Pool } from '../../lib/types';
import { serverURL } from '../../config';

import PoolDetails from './PoolDetails';

/** Renders a list of pools for the given assetId */
export default function AssetPoolList(props: {assetId: number}) {

  const [error, setError] = useState('');
  const [poolList, setPoolList] = useState<Pool[]>([]);

  axios.get(`${serverURL}/pool/list`, {
    params: {
      assetId: props.assetId
    }
  })
    .then((response) => {
      setPoolList(response.data.pools);
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
      <div className="pool-list">
        {error && <div className='error-message'>{`Error: ${error}`}</div>}
        {poolList.length > 0 &&
          poolList.map((pool) =>
            <PoolDetails
              pool={pool}
              key={pool.poolId}
            />
          )
        }
      </div>

    );
};
