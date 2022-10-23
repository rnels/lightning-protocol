import { useEffect, useState } from 'react';
import axios from '../../../lib/axios';
import { PoolLock } from '../../../lib/types';
import { serverURL } from '../../../config';

import PoolLockDetails from './PoolLockDetails';

/** Renders a list of pools locks provided poolId */
export default function PoolLockList(props: {poolId: number}) {

  const [error, setError] = useState('');
  const [poolLockList, setPoolLockList] = useState<PoolLock[]>([]);

  useEffect(() => {
    axios.get(`${serverURL}/pool/lock`, {
      params: {
        id: props.poolId
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
  }, [props.poolId])

    return (
      <div className="pool-lock-list">
        <h2>Locks</h2>
        {error && <div className='error-message'>{`Error: ${error}`}</div>}
        {poolLockList.length > 0 &&
          poolLockList.map((poolLock) =>
            <PoolLockDetails
              poolLock={poolLock}
              key={poolLock.poolLockId}
            />
          )
        }
      </div>

    );
};
