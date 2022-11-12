export default function TradeSalePrice(props: {salePrice: number}) {

  return (
    <div className='trade-sale-price'>
      {`Sale Price: $${(Math.trunc(props.salePrice * 100) / 100).toFixed(2)}`}
    </div>
  );

};
