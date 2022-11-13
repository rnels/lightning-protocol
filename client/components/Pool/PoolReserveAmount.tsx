export default function PoolReserveAmount(props: {reserveAmount: number}) {

  return (
    <div className='pool-reserve-amount'>
      {`Reserve Amount: $${props.reserveAmount}`}
    </div>
  );

};
