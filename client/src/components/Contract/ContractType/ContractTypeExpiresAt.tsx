export default function ContractTypeExpiresAt(props: {expiresAt: number}) {

    return (
      <div className="contract-type-expires-at">
        {`Expires: ${props.expiresAt}`}
      </div>
    );

};
