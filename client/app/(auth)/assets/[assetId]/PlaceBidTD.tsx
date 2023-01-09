'use client';

import { Asset, Bid, Contract, ContractType, Trade } from '../../../../lib/types';

import PlaceBidModal from './PlaceBidModal';
import { useState } from 'react';

/** Renders a row of data for the given ContractType */
export default function PlaceBidTD(props: {contractType: ContractType, asset: Asset, amountFilter: boolean, lowestAsk: number | null}) {

  const bidPrices = props.contractType.bids!.map((bid) => Number(bid.bidPrice));
  const highestBid = bidPrices.length > 0 ? Math.max(...bidPrices) : null;
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <td onClick={() => setShowModal(true)}>
      {highestBid === null ? 'N/A' :
      <>
      {`$${props.amountFilter ? (Math.trunc(highestBid * Number(props.asset.assetAmount) * 1000) / 1000).toFixed(3) : highestBid.toFixed(2)}`}
      <div>{`(x${props.contractType.bids!.length})`}</div>
      </>
      }
      {showModal &&
      <PlaceBidModal
        key={props.contractType.contractTypeId}
        asset={props.asset}
        contractType={props.contractType}
        defaultBid={props.lowestAsk || highestBid}
        onClose={() => setShowModal(false)}
      />}
    </td>
  );

};
