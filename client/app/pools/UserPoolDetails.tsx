'use client';

import * as api from '../../lib/api';
import { Asset, Pool } from '../../lib/types';
import PoolAssetAmount from './PoolAssetAmount';
// import PoolLockList from './PoolLock/PoolLockList';
import PoolTradeFees from './PoolTradeFees';
import PoolAssetModal from './PoolAssetModal';

import { useState } from 'react';
import React from 'react';
import PoolReserveAmount from './PoolReserveAmount';

export default function UserPoolDetails(props: { pool: Pool }) {

  const [pool, setPool] = useState<Pool>(props.pool);
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [assetModalType, setModalType] = useState<boolean>(false);

  function getPool() {
    api.getPool(pool.poolId)
      .then((pool) => setPool(pool))
      .catch((errorRes) => {
        console.log(errorRes);
      });
  }

  const lockedAmount = pool.poolLocks!.length > 0 ? pool.poolLocks!.map(
    (poolLock) => {
      if (poolLock.released) return 0;
      return Number(poolLock.assetAmount);
    })
    .reduce((sum, a=0) => sum + a) : 0;

  // TODO: Create option to withdraw unlocked reserve amount
  // Could probably just undo my deletes on the feesWithdrawModel and build from there
  const unlockedReserve = pool.poolLocks!.length > 0 ? pool.poolLocks!.map(
    (poolLock) => {
      if (!poolLock.released) return 0;
      return Number(poolLock.reserveAmount)}
    )
    .reduce((sum, a=0) => sum + a) : 0;

  const poolLockpremiumFeess = pool.poolLocks!.length > 0 ? pool.poolLocks!.map(
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
        Deposit
      </button>
      {pool.assetAmount > 0 &&
        <button onClick={() => {
          setShowAssetModal(true);
          setModalType(false);
        }}>
          Withdraw
        </button>
      }
      <PoolReserveAmount
        reserveAmount={unlockedReserve}
      />
      <div>
        {`Locked: ${lockedAmount ? `${lockedAmount.toFixed(2)} (${(lockedAmount / Number(pool.assetAmount) * 100).toFixed(2)}%)` : 0}`}
      </div>
      <div>
        {`Premium Fees: $${poolLockpremiumFeess.toFixed(2)}`}
      </div>
      {showAssetModal &&
      <PoolAssetModal
        pool={pool}
        unlockedAmount={Math.trunc((Number(pool.assetAmount) - lockedAmount) * 10000) / 10000}
        modalType={assetModalType}
        onClose={() => {
          setShowAssetModal(false);
          getPool();
        }}
      />}
    </div>
  );

};
