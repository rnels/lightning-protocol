export default function ContractAskPrice(props: {askPrice: number | undefined}) {

  return (
    <div className='contract-ask-price'>
      {`Ask Price: ${props.askPrice || 'N/A'}`}
    </div>
  );

};
