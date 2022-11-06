export default function ContractAskPrice(props: {askPrice: number | undefined}) {

    if (!props.askPrice) return null;

    return (
      <div className="contract-ask-price">
        {`Ask Price: ${props.askPrice}`}
      </div>

    );
};
