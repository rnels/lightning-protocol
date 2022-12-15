export default function ContractAskPrice(props: {askPrice: string | number | undefined}) {

  return (
    <div className='contract-ask-price'>
      {`Ask Price: $${props.askPrice || 'N/A'}`}
    </div>
  );

};
