export default function PoolLockTradeFees(props: {tradeFees: number}) {

  return (
    <div className="pool-lock-trade-fees">
      {`Fees: ${props.tradeFees}`}
    </div>
  );

};
