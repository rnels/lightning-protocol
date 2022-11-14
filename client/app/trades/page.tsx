import * as api from '../../lib/api';

import React from 'react';
import TradeDetails from './TradeDetails';
import { cookies } from 'next/headers';

/** Renders a list of trades for the logged in user */
export default async function UserTradesPage() {

  const trades = await getTrades();

  return (
    <div className='user-trades-page'>
      <h2>My Trades</h2>
      {trades.length > 0 &&
        trades.map((trade) =>
          <TradeDetails
            key={trade.tradeId}
            trade={trade}
          />
        )
      }
    </div>
  );

}

async function getTrades() {
  let cookie = cookies().get('lightning-app-cookie');
  let trades = await api.getUserTrades(cookie!.value);
  return trades;
}
