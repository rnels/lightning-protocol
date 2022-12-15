'use client';

import React from 'react';
import ContractDetails from './ContractDetails';
import ContractTypeDetails from './ContractTypeDetails';
import Link from 'next/link';
import { getAssetListOwnedExt } from '../../../lib/swr';

// const { url, fetcher, options } = getAssetListOwnedExt();

// TODO: Create an 'event log' view
// Convert events (sells, buys, exercises, etc.) into human-readable messages

/** Renders a list of contracts for the logged in user */
export default function UserContractsPage() {

  // TODO: Group contracts by ask price
  // TODO: Allow people to exercise and change ask of multiple contracts of the same type

  const { assets } = getAssetListOwnedExt();

  if (!assets) return null; // NOTE: Ideally I want this to return an error, but pre-flight on build gives me a problem when I do that

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
