'use client';

import React from 'react';
import TradeDetails from './TradeDetails';
import ContractTypeDetails from '../contracts/ContractTypeDetails';
import Link from 'next/link';
import { Trade } from '../../../lib/types';
import { getUserTrades } from '../../../lib/swr';
import { getContractType } from '../../../lib/api_user';


/** Renders a list of trades for the logged in user */
export default function UserTradesPage() {

  const { trades } = getUserTrades();
  if (!trades) return null;

  const renderElements =
    trades.map(async (trade) => {
      let contractType = await getContractType(trade.typeId); // TODO: This is slow, integrate this better
      return (
        <TradeDetails
          key={trade.tradeId}
          trade={trade}
          contractType={contractType}
        />
      )
    });

  return (
    <div className='user-bids-page'>
      <h2>My Trades</h2>
      <>{renderElements}</>
    </div>
  );

}

