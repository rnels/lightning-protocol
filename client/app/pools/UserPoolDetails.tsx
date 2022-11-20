'use client';

import * as api from '../../lib/api';
import { Asset, Pool } from "../../lib/types";
import PoolAssetAmount from "./PoolAssetAmount";
// import PoolLockList from "./PoolLock/PoolLockList";
import PoolTradeFees from "./PoolTradeFees";
import PoolAssetModal from "./PoolAssetModal";
import PoolFeesWithdrawModal from "./PoolFeesWithdrawModal";

import { useState } from 'react';
import React from 'react';
import PoolReserveAmount from './PoolReserveAmount';

export default function UserPoolDetails(props: { pool: Pool }) {

  const [pool, setPool] = useState<Pool>(props.pool);
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [assetModalType, setModalType] = useState<boolean>(false);
  const [showFeesModal, setShowFeesModal] = useState<boolean>(false);

  function getPool() {
    api.getPool(pool.poolId)
      .then((pool) => setPool(pool))
      .catch((errorRes) => {
        console.log(errorRes);
      });
  }

  const lockedAmount = pool.poolLocks!.length > 0 ? pool.poolLocks!.map(
    (poolLock) => Number(poolLock.assetAmount))
    .reduce((sum, a=0) => sum + a) : 0;

  const lockedFees = pool.poolLocks!.length > 0 ? pool.poolLocks!.map(
    (poolLock) => Number(poolLock.tradeFees))
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
        reserveAmount={pool.reserveAmount}
      />
      <PoolTradeFees
        tradeFees={pool.tradeFees}
      />
      {pool.tradeFees > 0.01 &&
        <button onClick={() => setShowFeesModal(true)}>
          Withdraw
        </button>
      }
      <div>
        {`Locked: ${lockedAmount ? `${lockedAmount.toFixed(2)} (${(lockedAmount / Number(pool.assetAmount) * 100).toFixed(2)}%)` : 0} `}
      </div>
      <div>
        {`Lock Fees: ${lockedFees ? `$${lockedFees.toFixed(2)}` : '$0'} `}
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
      {showFeesModal &&
      <PoolFeesWithdrawModal
        pool={pool}
        onClose={() => {
          setShowFeesModal(false);
          getPool();
        }}
      />}
    </div>
  );

};