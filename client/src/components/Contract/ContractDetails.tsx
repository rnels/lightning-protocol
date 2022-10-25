import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { serverURL } from '../../config';

import { Contract, ContractType } from "../../lib/types";
import ContractAskPrice from "./ContractAskPrice";
import ContractCreatedAt from "./ContractCreatedAt";
import ContractExercise from "./ContractExercise";
import ContractTypeDetails from "./ContractType/ContractTypeDetails";

export default function ContractDetails(props: {contract: Contract}) {

  // TODO: Possibly refactor to have a component for contractType details which hydrates its information by being passed down a typeId rather than the whole contractType object

  const [contractType, setContractType] = useState<ContractType>();

  // Receives contractType information for the given contract
  useEffect(() => {
    axios.get(`${serverURL}/contract/type`, {
      params: {
        typeId: props.contract.typeId
      }
    })
    .then((response) => {
      setContractType(response.data.contractType);
    })
    .catch((errorRes) => {
      console.log(errorRes);
    });
  }, [props.contract]);

    return (
      <div className="contract-details">
        <ContractAskPrice
          askPrice={props.contract.askPrice}
        />
        <ContractCreatedAt
          createdAt={props.contract.createdAt}
        />
        <ContractExercise
          exercised={props.contract.exercised}
          exercisedAmount={props.contract.exercisedAmount}
        />
        {/* {contractType && <ContractTypeDetails // COMMENTED OUT FOR NOW
          contractType={contractType}
        />} */}
      </div>

    );
};
