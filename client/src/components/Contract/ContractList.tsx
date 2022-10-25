import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { Contract } from '../../lib/types';
import { serverURL } from '../../config';

import ContractDetails from './ContractDetails';
import { useParams } from 'react-router-dom';

/** Renders a list of contracts for the given typeId (useParams) */
export default function ContractList() {

  const [error, setError] = useState('');
  const [contractList, setContractList] = useState<Contract[]>([]);

  const { typeId } = useParams();

  useEffect(() => {
    axios.get(`${serverURL}/contract/list`, {
      params: {
        typeId
      }
    })
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
  }, [typeId]);


    return (
      <div className="contract-list">
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
