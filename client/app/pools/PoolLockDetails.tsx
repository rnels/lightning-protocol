import { PoolLock } from "../../lib/types";
import PoolLockAssetAmount from "./PoolLockAssetAmount";
import PoolLockPremiumFees from "./PoolLockPremiumFees";

// TODO: Display contract type information
export default function PoolLockDetails(props: {poolLock: PoolLock}) {

  return (
    <div className="pool-lock-details">
      <PoolLockAssetAmount
        assetAmount={props.poolLock.assetAmount}
      />
      <PoolLockPremiumFees
        premiumFees={props.poolLock.premiumFees}
      />
    </div>
  );

};
