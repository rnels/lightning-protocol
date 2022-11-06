export default function ContractCreatedAt(props: {createdAt: number}) {

    return (
      <div className="contract-created-at">
        {`Created at: ${props.createdAt}`}
      </div>

    );
};
