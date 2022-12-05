'use client';

import * as api from '../../lib/api';
import { Contract, ContractType } from "../../lib/types";
import ContractAskPrice from "./ContractAskPrice";
import ContractExercised from "./ContractExercised";
// import ContractTypeDetails from "./ContractType/ContractTypeDetails";

import { useState } from 'react';
import ContractUpdateAskPriceModal from './ContractUpdateAskPriceModal';
import ContractExerciseModal from './ContractExerciseModal';
import { getContract } from '../../lib/swr';

export default function ContractDetails(props: { contract: Contract }) {

  const [useProps, setUseProps] = useState<boolean>(true);
  const [showAskModal, setShowAskModal] = useState<boolean>(false);
  const [showExerciseModal, setShowExerciseModal] = useState<boolean>(false);

  const { contract, updateContract } = getContract(props.contract.contractId, useProps ? props.contract : undefined);

  // useEffect(() => {
  //   if (useProps) {

  //   }
  // }, [useProps]);

  if (!contract) return null;

  function fetchContract() {
    if (useProps) setUseProps(false);
    else updateContract();
  }

  function deleteAsk() {
    if (!contract) return;
    api.removeAskPrice(contract.contractId)
      .then(() => fetchContract())
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
      <div>
      {`Sale Price: $${Math.trunc(Number(contract.trades![0].salePrice) * 100) / 100}`}
      </div>
      <div>
      {`Sale Cost: $${Math.trunc(Number(contract.trades![0].saleCost) * 100) / 100}`}
      </div>
      {!contract.exercised &&
      <button onClick={() => setShowAskModal(true)}>
        {contract.askPrice ? 'Update' : 'Sell'}
      </button>}
      {contract.askPrice &&
        <button onClick={deleteAsk}>
          Remove
        </button>
      }
      {showAskModal &&
      <ContractUpdateAskPriceModal
        contract={contract}
        onClose={() => {
          setShowAskModal(false);
        }}
        onSubmit={() => {
          fetchContract();
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
      {showExerciseModal &&
      <ContractExerciseModal
        contract={contract}
        onClose={() => {
          setShowExerciseModal(false);
        }}
        onSubmit={() => {
          fetchContract();
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
