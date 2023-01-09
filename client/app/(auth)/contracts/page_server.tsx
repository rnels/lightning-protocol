import * as api from '../../../lib/api_client';
import ContractDetails from './ContractDetails';

import React, { useEffect, useState } from 'react';
import ContractTypeDetails from './ContractTypeDetails';
import Link from 'next/link';
import { Asset } from '../../../lib/types';

// TODO: Create an 'event log' view
// Convert events (sells, buys, exercises, etc.) into human-readable messages

/** Renders a list of contracts for the logged in user */
export default async function UserContractsPage() {

  // TODO: Group contracts by ask price
  // TODO: Allow people to exercise and change ask of multiple contracts of the same type

  const [assets, setAssets] = useState<Asset[]>();

  useEffect(() => {
    api.getAssetListOwnedExt()
      .then((assetList) => setAssets(assetList)); // TODO: Implement useSWR
  }, []);

  if (!assets) return null;

  // Stops us from rendering any assets that don't contain contractTypes with contracts
  let renderAssets: any = {};
  assets.forEach((asset) => {
    renderAssets[asset.assetId] = [];
    asset.contractTypes!.forEach((contractType) => {
      if (contractType.contracts!.length > 0) {
        renderAssets[asset.assetId].push(
          <div key={contractType.contractTypeId}>
            <ContractTypeDetails
              key={contractType.contractTypeId}
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
