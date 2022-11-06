export default function ContractTypeExpiresAt(props: {expiresAt: Date}) {

    return (
      <div className='contract-type-expires-at'>
        {`Expires: ${props.expiresAt}`}
      </div>
    );

};
