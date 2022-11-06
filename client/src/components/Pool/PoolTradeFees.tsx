export default function PoolTradeFees(props: {tradeFees: number}) {

    return (
      <div className="pool-trade-fees">
        {`Fees: ${Math.trunc(props.tradeFees * 100) / 100}`}
      </div>

    );
};
