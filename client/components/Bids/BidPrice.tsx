export default function BidPrice(props: {bidPrice: number}) {

  return (
    <div className='bid-price'>
      {`Bid Price: ${props.bidPrice}`}
    </div>
  );
};
