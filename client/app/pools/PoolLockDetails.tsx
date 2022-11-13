import { PoolLock } from "../../lib/types";
import PoolLockAssetAmount from "./PoolLockAssetAmount";
import PoolLockTradeFees from "./PoolLockTradeFees";
import PoolLockExpiresAt from "./PoolLockExpiresAt";

// TODO: Display contract type information
export default function PoolLockDetails(props: {poolLock: PoolLock}) {

  return (
    <div className="pool-lock-details">
      <PoolLockAssetAmount
        assetAmount={props.poolLock.assetAmount}
      />
      <PoolLockTradeFees
        tradeFees={props.poolLock.tradeFees}
      />
      <PoolLockExpiresAt
        expiresAt={props.poolLock.expiresAt}
      />
    </div>
  );

};
