'use client';

import { Pool } from '../../lib/types';
import PoolAssetAmount from './PoolAssetAmount';
// import PoolLockList from './PoolLock/PoolLockList';
import PoolAssetModal from './PoolAssetModal';

import { useState } from 'react';
import React from 'react';
import PoolReserveAmount from './PoolReserveAmount';
import { getPool } from '../../lib/swr';

// TODO: Fix the bug where changing pool details (like buying assets) still shows a cached value when navigating away and back. This affects anything that uses client components I believe due to the server using static data fetching on page load (cache: 'force-cache' is the default). Aka we need to invalidate the cache or force a refresh. https://beta.nextjs.org/docs/data-fetching/fetching
export default function UserPoolDetails(props: { pool: Pool }) {

  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [assetModalType, setModalType] = useState<boolean>(false);

  const [useProps, setUseProps] = useState<boolean>(true);

  const { pool, updatePool } = getPool(props.pool.poolId, useProps ? props.pool : undefined);

  if (!pool) return null;

  function fetchPool() {
    if (useProps) setUseProps(false);
    else updatePool();
  }

  const lockedAmount = pool.poolLocks!.length > 0 ? pool.poolLocks!.map(
    (poolLock) => {
      if (poolLock.released) return 0;
      return Number(poolLock.assetAmount);
    })
    .reduce((sum, a=0) => sum + a) : 0;

  const lockReserves = pool.poolLocks!.length > 0 ? pool.poolLocks!.map(
    (poolLock) => Number(poolLock.reserveAmount))
    .reduce((sum, a=0) => sum + a) : 0;

  const poolLockPremiumFees = pool.poolLocks!.length > 0 ? pool.poolLocks!.map(
    (poolLock) => Number(poolLock.premiumFees))
    .reduce((sum, a=0) => sum + a) : 0;

  return (
    <div className='user-pool-details'>
      <PoolAssetAmount
        assetAmount={pool.assetAmount}
      />
      <button onClick={() => {
        setShowAssetModal(true);
        setModalType(true);
      }}>
        Buy
      </button>
      {pool.assetAmount > 0 &&
      <button onClick={() => {
        setShowAssetModal(true);
        setModalType(false);
      }}>
        Sell
      </button>
      }
      <PoolReserveAmount
        reserveAmount={lockReserves}
      />
      <div>
        {`Locked: ${lockedAmount ? `${lockedAmount.toFixed(2)} (${(lockedAmount / Number(pool.assetAmount) * 100).toFixed(2)}%)` : 0}`}
      </div>
      <div>
        {`Premium Fees: $${poolLockPremiumFees.toFixed(2)}`}
      </div>
      {showAssetModal &&
      <PoolAssetModal
        pool={pool}
        unlockedAmount={Math.trunc((Number(pool.assetAmount) - lockedAmount) * 10000) / 10000}
        modalType={assetModalType}
        onClose={() => {
          setShowAssetModal(false);
        }}
        onSubmit={() => {
          fetchPool();
        }}
      />}
    </div>
  );

};
