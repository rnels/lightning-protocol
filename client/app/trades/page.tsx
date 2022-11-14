import * as api from '../../lib/api';

import React from 'react';
import TradeDetails from './TradeDetails';
import { cookies } from 'next/headers';

/** Renders a list of trades for the logged in user */
export default async function UserTradesPage() {

  const trades = await getTrades();
  const renderElements = await Promise.all(
    trades.map(async (trade) => {
      let contractType = await getContractType(trade.typeId);
      return (
        <TradeDetails
          key={trade.tradeId}
          trade={trade}
          contractType={contractType}
        />
      )
    })
  );

  return (
    <div className='user-trades-page'>
      <h2>My Trades</h2>
      {renderElements}
    </div>
  );

}

async function getTrades() {
  let cookie = cookies().get('lightning-app-cookie');
  let trades = await api.getUserTrades(cookie!.value);
  return trades;
}

async function getContractType(typeId: number) {
  let cookie = cookies().get('lightning-app-cookie');
  let contractType = await api.getContractType(typeId, cookie!.value);
  return contractType;
}
