export default function ContractExercised(props: {exercised: boolean, exercisedAmount: string | number | undefined}) {

  if (!props.exercised) return null;

  return (
    <div className='contract-exercised'>
      <div>{`Exercised? ${props.exercised ? 'Yes' : 'No'}`}</div>
      <div>{props.exercised && `Exercised Amount: $${props.exercisedAmount}`}</div>
    </div>
  );

};
