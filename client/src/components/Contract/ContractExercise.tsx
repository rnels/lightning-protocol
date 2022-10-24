export default function ContractExercise(props: {exercised: boolean, exercisedAmount: number | undefined}) {

  if (!props.exercised) return null;

    return (
      <div className="contract-exercise">
        {`Exercised Amount: ${props.exercisedAmount}`}
      </div>

    );
};
