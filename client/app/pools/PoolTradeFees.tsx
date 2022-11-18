export default function PoolTradeFees(props: {tradeFees: string | number}) {

  return (
    <div className='pool-trade-fees'>
      {`Trade Fees: $${Math.trunc(Number(props.tradeFees) * 100) / 100}`}
    </div>
  );

};
