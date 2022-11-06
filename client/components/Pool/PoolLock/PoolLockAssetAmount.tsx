export default function PoolLockAssetAmount(props: {assetAmount: number}) {

  return (
    <div className="pool-lock-asset-amount">
      {`Amount: ${props.assetAmount}`}
    </div>
  );

};
