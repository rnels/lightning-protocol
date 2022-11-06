export default function PoolLockExpiresAt(props: {expiresAt: Date}) {

  return (
    <div className="pool-lock-expires-at">
      {`Expires: ${props.expiresAt}`}
    </div>
  );

};
