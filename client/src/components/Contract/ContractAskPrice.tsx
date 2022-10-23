export default function ContractAskPrice(props: {askPrice: number | undefined}) {

    return (
      <div className="contract-ask-price">
        {`Price: ${props.askPrice}`}
      </div>

    );
};
