import * as api from '../lib/api';
import { Asset, Contract } from '../lib/types';
import ContractDetails from '../components/Contract/ContractDetails';

import React from 'react';
import { GetServerSideProps } from 'next';
import ContractTypeDetails from '../components/Contract/ContractType/ContractTypeDetails';

/** Renders a list of contracts for the logged in user */
export default function UserContracts(props: { assets: Asset[] }) {

  return (
    <div className='user-contracts-page'>
      <h2>My Contracts</h2>
      {props.assets.length > 0 &&
        props.assets.map((asset) =>
        <div key={asset.assetId}>
          <h3><a href={`/assets/${asset.assetId}`}>{asset.name}</a></h3>
          {asset.contractTypes!.map((contractType) =>
            <>
              {contractType.bids!.length > 0 &&
              <div key={contractType.contractTypeId}>
                <ContractTypeDetails
                  contractType={contractType}
                />
                {contractType.contracts!.map((contract) =>
                  <ContractDetails
                    key={contract.contractId}
                    contract={contract}
                  />
                )}
              </div>
              }
            </>
          )}
        </div>
        )
    }
    </div>
  );

};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let assets = await api.getAssetListOwnedExt();

  return {
    props: {
      assets
    }
  }

};
