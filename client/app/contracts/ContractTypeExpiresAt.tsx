export default function ContractTypeExpiresAt(props: {expiresAt: string}) {
  return (
    <div className='contract-type-expires-at'>
      {`Expiry: ${new Date(props.expiresAt).toLocaleDateString('en-us', { year:'numeric', month:'short', day:'numeric' })}`}
    </div>
  );

};
