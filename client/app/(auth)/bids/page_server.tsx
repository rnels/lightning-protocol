// NOTE: This file doesn't work with the new API structure, kept as reference
import * as api from '../../../lib/api_client';

import React from 'react';
import BidDetails from './BidDetails';
import ContractTypeDetails from '../contracts/ContractTypeDetails';
import Link from 'next/link';
import { cookies } from 'next/headers';

/** Renders a list of bids for the logged in user */
export default async function UserBidsPage() {

  const assets = await getAssets();

  // Stops us from rendering any assets that don't contain contractTypes with bids
  let renderAssets: any = {};
  assets.forEach((asset) => {
    renderAssets[asset.assetId] = [];
    asset.contractTypes!.forEach((contractType) => {
      if (contractType.bids!.length > 0) {
        renderAssets[asset.assetId].push(
          <div key={contractType.contractTypeId}>
            <ContractTypeDetails
              contractType={contractType}
            />
            {contractType.bids!.map((bid) =>
              <BidDetails
                key={bid.bidId}
                bid={bid}
              />
            )}
          </div>
        );
      }
    });
  });

  return (
    <div className='user-bids-page'>
      <h2>My Bids</h2>
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
