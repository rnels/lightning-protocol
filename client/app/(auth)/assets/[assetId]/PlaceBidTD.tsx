'use client';

import { Asset, Bid, Contract, ContractType, Trade } from '../../../../lib/types';

import PlaceBidModal from './PlaceBidModal';
import { useState } from 'react';

/** Renders a row of data for the given ContractType */
export default function PlaceBidTD(
  props: {
    contractType: ContractType,
    asset: Asset,
    amountFilter: boolean,
    highestBid: number | null,
    lowestAsk: number | null
  }
) {

  const [showModal, setShowModal] = useState<boolean>(false);
  console.log(showModal);

  return (
    <td onClick={() => setShowModal(true)}>
      {props.highestBid === null ? 'N/A' :
      <>
      {`$${props.amountFilter ? (Math.trunc(props.highestBid * Number(props.asset.assetAmount) * 1000) / 1000).toFixed(3) : props.highestBid.toFixed(2)}`}
      <div>{`(x${props.contractType.bids!.length})`}</div>
      </>
      }
      {showModal &&
      <PlaceBidModal
        key={props.contractType.contractTypeId}
        asset={props.asset}
        contractType={props.contractType}
        defaultBid={props.lowestAsk || props.highestBid}
        onClose={() => setShowModal(false)}
      />}
    </td>
  );

};
