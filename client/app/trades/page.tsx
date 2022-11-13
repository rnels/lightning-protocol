import * as api from '../../lib/api';
import { Trade } from '../../lib/types';

import React from 'react';
import { GetServerSideProps } from 'next';
import TradeDetails from './TradeDetails';

/** Renders a list of trades for the logged in user */
export default function UserTradesPage(props: {trades: Trade[]}) {

  return (
    <div className='user-trades-page'>
      <h2>My Trades</h2>
      {props.trades.length > 0 &&
        props.trades.map((trade) =>
          <TradeDetails
            key={trade.tradeId}
            trade={trade}
          />
        )
      }
    </div>
  );

};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let cookie = context.req.cookies['lightning-app-cookie'];

  let trades: Trade[] = [];
  try {
    trades = await api.getUserTrades(cookie);
    return { props: { trades } };
  } catch (e) {
    console.log(e);
    return {
      props: {
        assets: []
      }
    };
  }
};
