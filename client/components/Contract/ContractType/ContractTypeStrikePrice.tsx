export default function ContractTypeStrikePrice(props: {strikePrice: number}) {

    return (
      <div className='contract-type-strike-price'>
        {`Strike Price: ${props.strikePrice}`}
      </div>

    );
};
