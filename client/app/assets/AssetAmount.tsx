export default function AssetAmount(props: {amount: string | number}) {

  return (
    <div className='asset-amount'>
      {props.amount}
    </div>
  );

}
