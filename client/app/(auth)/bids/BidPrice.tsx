export default function BidPrice(props: {bidPrice: string | number}) {

  return (
    <div className='bid-price'>
      {`Bid: $${props.bidPrice}`}
    </div>
  );

};
