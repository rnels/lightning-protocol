export default function ContractExercise(props: {exercised: boolean, exercisedAmount: number | undefined}) {
    return (
      <div className="contract-exercise">
        {`Exercised: ${props.exercised}`}
        {props.exercised &&
        `Exercised Amount: ${props.exercisedAmount}`
        }
      </div>

    );
};
