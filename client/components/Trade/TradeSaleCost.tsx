export default function TradeSaleCost(props: {saleCost: number}) {

  return (
    <div className='trade-sale-cost'>
      {`Sale Cost: $${(Math.trunc(props.saleCost * 100) / 100).toFixed(2)}`}
    </div>
  );

};
