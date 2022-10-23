export default function PoolTradeFees(props: {tradeFees: number}) {

    return (
      <div className="pool-trade-fees">
        {`Fees: ${props.tradeFees}`}
      </div>

    );
};
