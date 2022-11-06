export default function ContractExercised(props: {exercised: boolean, exercisedAmount: number | undefined}) {

  if (!props.exercised) return null;

    return (
      <div className='contract-exercised'>
        {`Exercised? ${props.exercised ? 'Yes' : 'No'}`}
        {props.exercised && `Exercised Amount: ${props.exercisedAmount}`}
      </div>

    );
};
