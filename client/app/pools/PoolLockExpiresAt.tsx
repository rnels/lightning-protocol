export default function PoolLockExpiresAt(props: {expiresAt: string}) {

  return (
    <div className="pool-lock-expires-at">
      {`Expires: ${props.expiresAt}`}
    </div>
  );

};
