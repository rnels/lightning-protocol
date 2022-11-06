import * as api from '../lib/api';
import { Bid } from '../lib/types';

import React from 'react';
import { GetServerSideProps } from 'next';
import BidDetails from '../components/Bids/BidDetails';

/** Renders a list of bids for the logged in user */
export default function UserBids(props: { bids: Bid[] }) {

    return (
      <div className='user-bids-page'>
        <h2>My Bids</h2>
        {props.bids.length > 0 &&
          props.bids.map((bid) =>
            <BidDetails
              key={bid.bidId}
              bid={bid}
            />
          )
        }
      </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let bids = await api.getUserBids();

  return {
    props: {
      bids
    }
  }

};
