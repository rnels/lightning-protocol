import { useState } from 'react';
import axios from '../../lib/axios';
import { Pool } from '../../lib/types';
import { serverURL } from '../../config';

import PoolDetails from './PoolDetails';

import {
  useParams
} from "react-router-dom";

/** Renders a list of pools for the given assetId */
// TODO: Take any component with useParams and have it encapsulated in a view component
export default function AssetPoolList() {

  const [error, setError] = useState('');
  const [poolList, setPoolList] = useState<Pool[]>([]);
  const { assetId } = useParams();

  axios.get(`${serverURL}/pool/list`, {
    params: {
      assetId
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
        <h2>Pools</h2>
        {error && <div className='error-message'>{`Error: ${error}`}</div>}
        {poolList.length > 0 ?
          poolList.map((pool) =>
            <PoolDetails
              pool={pool}
              key={pool.poolId}
            />
          )
          :
          <p>There are no pools for this asset</p>
        }
      </div>

    );
};
