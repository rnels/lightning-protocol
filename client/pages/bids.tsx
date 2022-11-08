import * as api from '../lib/api';
import { Asset, Bid } from '../lib/types';

import React from 'react';
import { GetServerSideProps } from 'next';
import BidDetails from '../components/Bids/BidDetails';
import ContractTypeDetails from '../components/Contract/ContractType/ContractTypeDetails';
import Link from 'next/link';

/** Renders a list of bids for the logged in user */
export default function UserBids(props: { assets: Asset[] }) {

  // Stops us from rendering any assets that don't contain contractTypes with bids
  let renderAssets: any = {};
  props.assets.forEach((asset) => {
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

  let assets: any[] = [];
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