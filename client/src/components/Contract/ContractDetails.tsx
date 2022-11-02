import * as api from '../../lib/api';
import { Contract, ContractType } from "../../lib/types";
import ContractAskPrice from "./ContractAskPrice";
import ContractCreatedAt from "./ContractCreatedAt";
import ContractExercised from "./ContractExercised";
// import ContractTypeDetails from "./ContractType/ContractTypeDetails";

import { useState, useEffect } from 'react';

export default function ContractDetails(props: {contract: Contract}) {

  // TODO: Possibly refactor to have a component for contractType details which hydrates its information by being passed down a typeId rather than the whole contractType object

  const [contractType, setContractType] = useState<ContractType>();

  // Receives contractType information for the given contract
  useEffect(() => {
    api.getContractType(props.contract.typeId)
      .then((contractType) => setContractType(contractType))
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
        <ContractExercised
          exercised={props.contract.exercised}
          exercisedAmount={props.contract.exercisedAmount}
        />
        {/* {contractType && <ContractTypeDetails // COMMENTED OUT FOR NOW
          contractType={contractType}
        />} */}
      </div>

    );
};
