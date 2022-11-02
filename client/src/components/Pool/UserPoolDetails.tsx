import * as api from '../../lib/api';
import { Asset, Pool } from "../../lib/types";
import PoolAssetAmount from "./PoolAssetAmount";
// import PoolLockList from "./PoolLock/PoolLockList";
import PoolTradeFees from "./PoolTradeFees";
import PoolAssetModal from "./PoolAssetModal";
import PoolFeesWithdrawModal from "./PoolFeesWithdrawModal";

import { useEffect, useState } from 'react';
import { Link, Outlet } from "react-router-dom";


// TODO: Determine if I want to use routing for this instead
export default function UserPoolDetails(props: {pool: Pool}) {

  const [asset, setAsset] = useState<Asset>();
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

  useEffect(() => {
    getPool();
  });

  useEffect(() => {
    if (asset || !pool) return;
    api.getAsset(pool.assetId)
      .then((asset) => setAsset(asset))
      .catch((errorRes) => {
        console.log(errorRes);
      });

  }, [asset, pool]);

  if (!asset || !pool) return null;

    return (
      <div className="pool-details">
        <h3><a href={`/assets/${asset.assetId}`}>{asset.name}</a></h3>
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
        <Link to={`${pool.poolId}/locks`}>
          Locks
        </Link>
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
