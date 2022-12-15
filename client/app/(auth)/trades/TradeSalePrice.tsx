export default function TradeSalePrice(props: {salePrice: string | number}) {

  return (
    <div className='trade-sale-price'>
      {`Sale Price: $${(Math.trunc(Number(props.salePrice) * 100) / 100).toFixed(2)}`}
    </div>
  );

};
