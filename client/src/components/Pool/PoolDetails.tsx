import { Pool } from "../../lib/types";
import PoolAssetAmount from "./PoolAssetAmount";
import PoolLockList from "./PoolLocks/PoolLockList";
import PoolTradeFees from "./PoolTradeFees";

export default function PoolDetails(props: {pool: Pool}) {
    return (
      <div className="pool-details">
        <p>{`Pool ${props.pool.poolId}`}</p>
        <PoolAssetAmount
          assetAmount={props.pool.assetAmount}
        />
        <PoolTradeFees
          tradeFees={props.pool.tradeFees}
        />
        <PoolLockList
          poolId={props.pool.poolId}
        />
      </div>

    );
};
