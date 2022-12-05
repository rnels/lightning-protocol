'use client';

import * as api from '../../lib/api';

import React, { useEffect, useState } from 'react';
import BidDetails from './BidDetails';
import ContractTypeDetails from '../contracts/ContractTypeDetails';
import Link from 'next/link';
import { Asset } from '../../lib/types';

/** Renders a list of bids for the logged in user */
export default function UserBidsPage() {

  const [assets, setAssets] = useState<Asset[]>();

  useEffect(() => {
    api.getAssetListOwnedExt()
      .then((assetList) => setAssets(assetList)); // TODO: Implement useSWR
  }, []);

  if (!assets) return null;

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
