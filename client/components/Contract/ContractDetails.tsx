import * as api from '../../lib/api';
import { Contract, ContractType } from "../../lib/types";
import ContractAskPrice from "./ContractAskPrice";
import ContractCreatedAt from "./ContractCreatedAt";
import ContractExercised from "./ContractExercised";
// import ContractTypeDetails from "./ContractType/ContractTypeDetails";

import { useState, useEffect } from 'react';
import ContractUpdateAskPriceModal from './ContractUpdateAskPriceModal';
import ContractExerciseModal from './ContractExerciseModal';

export default function ContractDetails(props: { contract: Contract }) {

  const [contract, setContract] = useState<Contract>(props.contract);
  const [showAskModal, setShowAskModal] = useState<boolean>(false);
  const [showExerciseModal, setShowExerciseModal] = useState<boolean>(false);

  function getContractDetails() {
    api.getContract(contract.contractId)
      .then((contract) => setContract(contract))
      .catch((error) => console.log(error));
  }

  // TODO: Possibly refactor to have a component for contractType details which hydrates its information by being passed down a typeId rather than the whole contractType object

  // const [contractType, setContractType] = useState<ContractType>();

  // Receives contractType information for the given contract
  // useEffect(() => {
  //   api.getContractType(props.contract.typeId)
  //     .then((contractType) => setContractType(contractType))
  //     .catch((errorRes) => {
  //       console.log(errorRes);
  //     });
  // }, [props.contract]);

  return (
    <div className='contract-details'>
      {contract.askPrice && <ContractAskPrice
        askPrice={contract.askPrice}
      />}
      <button onClick={() => setShowAskModal(true)}>
        {contract.askPrice ? 'Update' : 'Sell'}
      </button>
      {showAskModal && <ContractUpdateAskPriceModal
      contract={contract}
      onClose={() => {
        setShowAskModal(false);
        getContractDetails();
      }}
      />}
      {/* <ContractCreatedAt
        createdAt={contract.createdAt}
      /> */}
      <ContractExercised
        exercised={contract.exercised}
        exercisedAmount={contract.exercisedAmount}
      />
      {!contract.exercised &&
        <>
        <button onClick={() => setShowExerciseModal(true)}>
          Exercise
        </button>
        {showExerciseModal && <ContractExerciseModal
          contract={contract}
          onClose={() => {
            setShowExerciseModal(false);
            getContractDetails();
          }}
          />}
        </>
      }
      {/* {contractType && <ContractTypeDetails // COMMENTED OUT FOR NOW
        contractType={contractType}
      />} */}
    </div>
  );

};
