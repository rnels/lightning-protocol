import * as api from '../../lib/api';
import { Contract } from '../../lib/types';
import ContractDetails from './ContractDetails';

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

/** Renders a list of contracts for the given typeId (useParams) */
export default function ContractList() {

  const [error, setError] = useState('');
  const [contractList, setContractList] = useState<Contract[]>([]);

  const { typeId } = useParams();

  useEffect(() => {
    if (!typeId) return;
    api.getContractListByType(typeId)
      .then((contracts) => setContractList(contracts))
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
