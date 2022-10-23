import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { Contract } from '../../lib/types';
import { serverURL } from '../../config';

import ContractDetails from './ContractDetails';

/** Renders a list of contracts for the logged in user */
export default function UserContractList(props: any) {

  const [error, setError] = useState('');
  const [contractList, setContractList] = useState<Contract[]>([]);

  useEffect(() => {
    axios.get(`${serverURL}/contract/owned`)
    .then((response) => {
      setContractList(response.data.contracts);
    })
    .catch((errorRes) => {
      console.log(errorRes);
      if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
        setError(errorRes.response.data.message);
      } else {
        setError(errorRes.message);
      }
    });
  }, [])

    return (
      <div className="contract-list">
        <h2>My Contracts</h2>
        {error && <div className='error-message'>{`Error: ${error}`}</div>}
        {contractList.length > 0 &&
          contractList.map((contract) =>
            <ContractDetails
              contract={contract}
              key={contract.contractId}
            />
          )
        }
      </div>

    );
};
