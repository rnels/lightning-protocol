export default function ContractTypeDirection(props: {direction: boolean}) {

    return (
      <div className="contract-type-direction">
        {`Direction: ${props.direction ? 'Call' : 'Put'}`}
      </div>

    );
};
