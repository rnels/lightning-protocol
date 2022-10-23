export default function ContractTypeDirection(props: {direction: boolean}) {

    return (
      <div className="pool-lock-trade-fees">
        {`Direction: ${props.direction ? 'Call' : 'Put'}`}
      </div>

    );
};
