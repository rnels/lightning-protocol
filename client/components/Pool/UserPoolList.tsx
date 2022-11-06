import * as api from '../../lib/api';
import { Pool } from '../../lib/types';
import UserPoolDetails from './UserPoolDetails';

import { useEffect, useState } from 'react';
import React from 'react';

/** Renders a list of pools for the logged in user */
export default function UserPoolList(props: any) {

  const [error, setError] = useState('');
  const [poolList, setPoolList] = useState<Pool[]>([]);
  useEffect(() => {
    api.getUserPools()
      .then((pools) => setPoolList(pools))
      .catch((errorRes) => {
        console.log(errorRes);
        if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
          setError(errorRes.response.data.message);
        } else {
          setError(errorRes.message);
        }
      });
  }, []);

    return (
      <div className='user-pool-list'>
        <h2>My Pools</h2>
        {error && <div className='error-message'>{`Error: ${error}`}</div>}
        {poolList.length > 0 &&
          poolList.map((pool) =>
            <UserPoolDetails
              pool={pool}
              key={pool.poolId}
            />
          )
        }
      </div>

    );
};
