import * as api from '../lib/api';
import { Asset, Bid } from '../lib/types';

import React from 'react';
import { GetServerSideProps } from 'next';
import BidDetails from '../components/Bids/BidDetails';
import ContractTypeDetails from '../components/Contract/ContractType/ContractTypeDetails';

/** Renders a list of bids for the logged in user */
export default function UserBids(props: { assets: Asset[] }) {

  return (
    // <div className='user-bids-page'>
    //   <h2>My Bids</h2>
    //   {props.bids.length > 0 &&
    //     props.bids.map((bid) =>
    //       <BidDetails
    //         key={bid.bidId}
    //         bid={bid}
    //       />
    //     )
    //   }
    // </div>
    <div className='user-bids-page'>
    <h2>My Bids</h2>
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
              {contractType.bids!.map((bid) =>
                <BidDetails
                  key={bid.bidId}
                  bid={bid}
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
