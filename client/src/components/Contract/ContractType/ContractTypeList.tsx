import { useEffect, useState } from 'react';
import axios from '../../../lib/axios';
import { ContractType } from '../../../lib/types';
import { serverURL } from '../../../config';

import ContractTypeDetails from './ContractTypeDetails';
import { Link, Outlet, useParams } from 'react-router-dom';


/** Renders a list of contract types for the provided assetId */
// TODO: Make another component which spits out the bid / ask data for a given typeId
export default function ContractTypeList() {

  const [error, setError] = useState('');
  const [contractTypeList, setContractTypeList] = useState<ContractType[]>([]);

  const { assetId } = useParams();

  useEffect(() => {
    axios.get(`${serverURL}/contract/type/list`, {
      params: {
        assetId
      }
    })
    .then((response) => {
      setContractTypeList(response.data.contractTypes);
    })
    .catch((errorRes) => {
      console.log(errorRes);
      if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
        setError(errorRes.response.data.message);
      } else {
        setError(errorRes.message);
      }
    });
  }, [assetId]);

    return (
      <div className="contract-type-list">
        <h2>Contract Types</h2>
        {error && <div className='error-message'>{`Error: ${error}`}</div>}
        {contractTypeList.length > 0 ?
          <>
          {contractTypeList.map((contractType) =>
            <>
            <ContractTypeDetails
              contractType={contractType}
              key={contractType.contractTypeId}
            />
            <Link to={contractType.contractTypeId.toString()}>
              Contracts
            </Link>
            </>
          )}
          <Outlet />
          </>
          :
          <p>There are no contract types for this asset</p>
        }
      </div>

    );
};
