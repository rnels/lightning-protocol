import * as api from '../../lib/api';
import ContractDetails from './ContractDetails';

import React from 'react';
import ContractTypeDetails from './ContractTypeDetails';
import Link from 'next/link';
import { cookies } from 'next/headers';

/** Renders a list of contracts for the logged in user */
export default async function UserContractsPage() {

  // TODO: Group contracts by ask price
  // TODO: Allow people to exercise and change ask of multiple contracts of the same type

  const assets = await getAssets();

  // Stops us from rendering any assets that don't contain contractTypes with contracts
  let renderAssets: any = {};
  assets.forEach((asset) => {
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
      {assets.length > 0 &&
        assets.map((asset) =>
          renderAssets[asset.assetId].length > 0 &&
          <div key={asset.assetId}>
            <h3><Link href={`/assets/${asset.assetId}`}>{asset.name}</Link></h3>
            {renderAssets[asset.assetId]}
          </div>
        )
      }
    </div>
  );

}

async function getAssets() {
  let cookie = cookies().get('lightning-app-cookie');
  let assetList = await api.getAssetListOwnedExt(cookie!.value);
  return assetList;
}
