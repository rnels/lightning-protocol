export default function TradeCreatedAt(props: {createdAt: string}) {
  return (
    <div className='trade-created-at'>
      {`${new Date(props.createdAt).toLocaleDateString('en-us', { year:'numeric', month:'short', day:'numeric' })}`}
    </div>
  );

};
