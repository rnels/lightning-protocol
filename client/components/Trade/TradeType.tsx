export default function TradeType(props: {isBuyer: boolean}) {

  return (
    <div className='trade-type'>
      {props.isBuyer ? 'Buy' : 'Sell'}
    </div>
  );

};
