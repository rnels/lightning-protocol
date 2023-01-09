'use client';

import * as api from '../../../lib/api_user';
import { Bid } from "../../../lib/types";

import { useState } from 'react';
import UpdateBidPriceModal from './UpdateBidPriceModal';
import BidPrice from './BidPrice';
import { getBid, getAssetListOwnedExt } from '../../../lib/swr';

export default function BidDetails(props: { bid: Bid }) {

  const [useProps, setUseProps] = useState<boolean>(true);
  const [showBidModal, setShowBidModal] = useState<boolean>(false);

  const { updateAssetListOwnedExt } = getAssetListOwnedExt();
  const { bid, updateBid } = getBid(props.bid.bidId, useProps ? props.bid : undefined);

  if (!bid) {
    updateAssetListOwnedExt(); // TODO: Find out a better way. This is currently used to update the list when a bid meets an ask and is exercised
    return null;
  }

  function fetchBid() {
    if (useProps) setUseProps(false);
    else updateBid();
  }

  function deleteBid() {
    if (!bid) return;
    api.removeBid(bid.bidId)
      .then(() => {
        updateAssetListOwnedExt();
      })
      .catch((error) => console.log(error));
  }

  return (
    <div className='bid-details'>
      <BidPrice
        bidPrice={bid.bidPrice}
      />
      <button onClick={() => setShowBidModal(true)}>
        Update
      </button>
      <button onClick={deleteBid}>
        Delete
      </button>
      {showBidModal &&
      <UpdateBidPriceModal
        bid={bid}
        onSubmit={() => {
          fetchBid();
        }}
        onClose={() => {
          setShowBidModal(false);
        }}
      />}
    </div>
  );

};
