import * as api from '../../lib/api';
import { Bid, Contract, ContractType } from "../../lib/types";

import { useState, useEffect } from 'react';
import UpdateBidPriceModal from './UpdateBidPriceModal';
import BidPrice from './BidPrice';

export default function BidDetails(props: { bid: Bid }) {

  const [bid, setBid] = useState<Bid>(props.bid);
  const [showBidModal, setShowBidModal] = useState<boolean>(false);
  const [removed, setRemoved] = useState<boolean>(false);

  function getBidDetails() {
    api.getBid(bid.bidId)
      .then((bid) => setBid(bid))
      .catch((error) => console.log(error));
  }

  function deleteBid() {
    api.removeBid(bid.bidId)
      .then(() => setRemoved(true))
      .catch((error) => console.log(error));
  }

  if (removed) return null;

  return (
    <div className='bid-details'>
      <button onClick={() => setShowBidModal(true)}>
        Update
      </button>
      <button onClick={deleteBid}>
        Delete
      </button>
      <BidPrice
        bidPrice={bid.bidPrice}
      />
      {showBidModal && <UpdateBidPriceModal
      bid={bid}
      onClose={() => {
        setShowBidModal(false);
        getBidDetails();
      }}
      />}
      {/* {contractType && <ContractTypeDetails // COMMENTED OUT FOR NOW
        contractType={contractType}
      />} */}
    </div>
  );

};
