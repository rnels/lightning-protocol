import { useEffect, useState } from 'react';
import axios from '../../../lib/axios';
import { PoolLock } from '../../../lib/types';
import { serverURL } from '../../../config';

import PoolLockDetails from './PoolLockDetails';
import { useParams } from 'react-router-dom';

/** Renders a list of pools locks for the provided poolId */
export default function PoolLockList() {

  const { poolId } = useParams();

  const [error, setError] = useState('');
  const [poolLockList, setPoolLockList] = useState<PoolLock[]>([]);

  useEffect(() => {
    axios.get(`${serverURL}/pool/lock`, {
      params: {
        id: poolId
      }
    })
    .then((response) => {
      setPoolLockList(response.data.poolLocks);
    })
    .catch((errorRes) => {
      console.log(errorRes);
      if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
        setError(errorRes.response.data.message);
      } else {
        setError(errorRes.message);
      }
    });
  }, [poolId])

    return (
      <div className="pool-lock-list">
        <h4>Locks</h4>
        {error && <div className='error-message'>{`Error: ${error}`}</div>}
        {poolLockList.length > 0 ?
          poolLockList.map((poolLock) =>
            <PoolLockDetails
              poolLock={poolLock}
              key={poolLock.poolLockId}
            />
          )
          :
          <p>There are no pool locks for this asset</p>
        }
      </div>

    );
};
