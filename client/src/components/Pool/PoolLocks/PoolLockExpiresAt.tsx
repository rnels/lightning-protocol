export default function PoolLockExpiresAt(props: {expiresAt: number}) {

    return (
      <div className="pool-lock-expires-at">
        {`Expires: ${props.expiresAt}`}
      </div>
    );

};
