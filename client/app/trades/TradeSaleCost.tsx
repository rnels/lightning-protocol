export default function TradeSaleCost(props: {saleCost: string | number}) {

  return (
    <div className='trade-sale-cost'>
      {`Sale Cost: $${(Math.trunc(Number(props.saleCost) * 100) / 100).toFixed(2)}`}
    </div>
  );

};
