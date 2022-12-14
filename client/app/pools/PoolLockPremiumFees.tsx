export default function PoolLockPremiumFees(props: {premiumFees: string | number}) {

  return (
    <div className="pool-lock-premium-fees">
      {`Premium Fees: ${props.premiumFees}`}
    </div>
  );

};
