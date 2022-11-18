export default function PoolAssetAmount(props: {assetAmount: string | number}) {

  return (
    <div className='pool-asset-amount'>
      {`Amount: ${props.assetAmount}`}
    </div>
  );

};
