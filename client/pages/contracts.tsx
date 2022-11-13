import * as api from '../lib/api';
import { Asset, Contract } from '../lib/types';
import ContractDetails from '../components/Contract/ContractDetails';

import React from 'react';
import { GetServerSideProps } from 'next';
import ContractTypeDetails from '../components/Contract/ContractType/ContractTypeDetails';
import Link from 'next/link';

/** Renders a list of contracts for the logged in user */
export default function UserContracts(props: { assets: Asset[] }) {

  // TODO: Group contracts by ask price
  // TODO: Allow people to exercise and change ask of multiple contracts of the same type

  // Stops us from rendering any assets that don't contain contractTypes with contracts
  let renderAssets: any = {};
  props.assets.forEach((asset) => {
    renderAssets[asset.assetId] = [];
    asset.contractTypes!.forEach((contractType) => {
      if (contractType.contracts!.length > 0) {
        renderAssets[asset.assetId].push(
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
        );
      }
    });
  });

  return (
    <div className='user-contracts-page'>
      <h2>My Contracts</h2>
      {props.assets.length > 0 &&
        props.assets.map((asset) =>
          renderAssets[asset.assetId].length > 0 &&
          <div key={asset.assetId}>
            <h3><Link href={`/assets/${asset.assetId}`}>{asset.name}</Link></h3>
            {renderAssets[asset.assetId]}
          </div>
        )
      }
    </div>
  );

};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let cookie = context.req.cookies['lightning-app-cookie'];

  let assets: Asset[] = [];
  try {
    assets = await api.getAssetListOwnedExt(cookie);
    return { props: { assets } };
  } catch (e) {
    return {
      props: {
        assets: []
      }
    };
  }
};