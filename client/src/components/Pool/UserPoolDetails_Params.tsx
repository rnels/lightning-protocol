import * as api from '../../lib/api';
import { Asset, Pool } from "../../lib/types";
import PoolAssetAmount from "./PoolAssetAmount";
// import PoolLockList from "./PoolLock/PoolLockList";
import PoolTradeFees from "./PoolTradeFees";
import PoolAssetModal from "./PoolAssetModal";
import PoolFeesWithdrawModal from "./PoolFeesWithdrawModal";

import { useEffect, useState } from 'react';
import { Link, Outlet, useParams } from "react-router-dom";


// TODO: Determine if I want to use routing for this instead
// Could extend an asset ID instead of being passed the pool as a prop from UserPoolList
// But I would need to make a route to get a pool for a user by asset ID and user ID
export default function UserPoolDetails(props: any) {

  const [pool, setPool] = useState<Pool>();
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [assetModalType, setModalType] = useState<boolean>(false);
  const [showFeesModal, setShowFeesModal] = useState<boolean>(false);

  const { assetId } = useParams();

  function getPool() {
    if (!assetId) return;
    api.getUserPoolByAssetId(assetId)
      .then((pool) => setPool(pool))
      .catch((errorRes) => {
        console.log(errorRes);
      });
  }

  useEffect(() => {
    getPool();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!assetId || !pool) return null;

  console.log(pool);

    return (
      <div className="pool-details">
        <PoolAssetAmount
          assetAmount={pool.assetAmount}
        />
        <button onClick={() => {
          setShowAssetModal(true);
          setModalType(true);
        }}>
          Deposit
        </button>
        <button onClick={() => {
          setShowAssetModal(true);
          setModalType(false);
        }}>
          Withdraw
        </button>
        <PoolTradeFees
          tradeFees={pool.tradeFees}
        />
        <button onClick={() => setShowFeesModal(true)}>
          Withdraw
        </button>
        <div>
          <Link to={`/pools/${pool.poolId}/locks`}>
            Locks
          </Link>
        </div>
        {showAssetModal && <PoolAssetModal
        key={pool.poolId}
        pool={pool}
        modalType={assetModalType}
        onClose={() => {
          setShowAssetModal(false);
          getPool();
        }}
        />}
        {showFeesModal && <PoolFeesWithdrawModal
        key={pool.poolId}
        pool={pool}
        onClose={() => {
          setShowFeesModal(false);
          getPool();
        }}
        />}
        <Outlet/>
      </div>

    );
};
