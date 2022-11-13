export default function TradeCreatedAt(props: {createdAt: string}) {

  return (
    <div className='trade-created-at'>
      {`Created at: ${props.createdAt}`}
    </div>
  );

};
