import * as api from '../lib/api';
import { Contract } from '../lib/types';
import ContractDetails from '../components/Contract/ContractDetails';

import React from 'react';
import { GetServerSideProps } from 'next';

/** Renders a list of contracts for the logged in user */
export default function UserContracts(props: { contracts: Contract[] }) {

    return (
      <div className='user-contracts-page'>
        <h2>My Contracts</h2>
        {props.contracts.length > 0 &&
          props.contracts.map((contract) =>
            <ContractDetails
              key={contract.contractId}
              contract={contract}
            />
          )
        }
      </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let contracts = await api.getUserContracts();

  return {
    props: {
      contracts
    }
  }

};
