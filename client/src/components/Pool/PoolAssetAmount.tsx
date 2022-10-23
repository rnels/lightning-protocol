export default function PoolAssetAmount(props: {assetAmount: number}) {

    return (
      <div className="pool-asset-amount">
        {`Amount: ${props.assetAmount}`}
      </div>

    );
};
