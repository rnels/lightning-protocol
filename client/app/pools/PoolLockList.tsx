'use client';

import { errorMessage as errorMessageStyle } from '../styles.module.css';
import * as api from '../../lib/api';
import { PoolLock, Pool } from '../../lib/types';
import PoolLockDetails from './PoolLockDetails';

import { useEffect, useState } from 'react';

/** Renders a list of pools locks for the provided pool */
// TODO: Use this somewhere
export default function PoolLockList(props: { pool: Pool }) {

  const [error, setError] = useState('');
  const [poolLockList, setPoolLockList] = useState<PoolLock[]>([]);

  useEffect(() => {
    if (!props.pool) return;
    api.getPoolLocksByPoolId(props.pool.poolId)
      .then((poolLocks) => setPoolLockList(poolLocks))
      .catch((errorRes) => {
        console.log(errorRes);
        if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
          setError(errorRes.response.data.message);
        } else {
          setError(errorRes.message);
        }
      });
  }, [props.pool])

  return (
    <div className="pool-lock-list">
      <h4>Locks</h4>
      {error && <div className={errorMessageStyle}>{`Error: ${error}`}</div>}
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
