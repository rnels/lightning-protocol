import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { serverURL } from '../../config';

import { Contract, ContractType } from "../../lib/types";
import ContractAskPrice from "./ContractAskPrice";
import ContractCreatedAt from "./ContractCreatedAt";
import ContractExercise from "./ContractExercise";
import ContractTypeDetails from "./ContractType/ContractTypeDetails";

export default function ContractDetails(props: {contract: Contract}) {

  const [contractType, setContractType] = useState<ContractType>();

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
        <p>{`Contract ${props.contract.contractId}`}</p>
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
        {contractType && <ContractTypeDetails
          contractType={contractType}
        />}
      </div>

    );
};
