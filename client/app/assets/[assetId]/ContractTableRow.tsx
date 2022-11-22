'use client';

import styles from '../assets.module.css';
import { Asset, Bid, Contract, ContractType, Trade } from '../../../lib/types';
import * as api from '../../../lib/api';

import { useEffect, useState } from 'react';
import PlaceBidModal from './PlaceBidModal';

/** Renders a row of data for the given ContractType */
export default function ContractTableRow(props: {contractType: ContractType, asset: Asset, amountFilter: boolean}) {

  const [contracts, setContracts] = useState<Contract[]>([]);
  function getContracts() {
    api.getContractListByType(props.contractType.contractTypeId)
      .then((contractList) => setContracts(contractList!))
      .catch((err) => console.log(err));
  }

  const [bids, setBids] = useState<Bid[]>([]);
  function getBidsByType() {
    api.getBidsByType(props.contractType.contractTypeId)
      .then((bids) => setBids(bids))
      .catch((err) => console.log(err));
  }

  const [asks, setAsks] = useState<{askPrice: string | number, contractId: number}[]>([]);
  function getAsks() {
    api.getAsks(props.contractType.contractTypeId)
      .then((asks) => setAsks(asks))
      .catch((err) => console.log(err));
  }

  const [lastTrade, setLastTrade] = useState<Trade>();
  function getLastTrade() {
    api.getLastTrade(props.contractType.contractTypeId)
      .then((trade) => setLastTrade(trade))
      .catch((err) => console.log(err));
  }

  const [dailyTrades, setDailyTrades] = useState<Trade[]>([]);
  function getDailyTrades() {
    api.getDailyTrades(props.contractType.contractTypeId)
      .then((trades) => setDailyTrades(trades))
      .catch((err) => console.log(err));
  }

  const [dailyPriceChange, setDailyPriceChange] = useState<number>();
  function getDailyPriceChange() {
    api.getDailyPriceChange(props.contractType.contractTypeId)
      .then((priceChange) => setDailyPriceChange(priceChange))
      .catch((err) => console.log(err));
  }

  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    getContracts();
    getBidsByType();
    getAsks();
    getLastTrade();
    getDailyTrades();
    getDailyPriceChange();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.contractType]);

  let askPrices = asks.map((ask) => Number(ask.askPrice));
  const lowestAsk = askPrices.length > 0 ? Math.min(...askPrices) : null;
  let bidPrices = bids.map((bid) => Number(bid.bidPrice));
  const highestBid = bidPrices.length > 0 ? Math.max(...bidPrices) : null;
  const lastPrice = lastTrade ? Number(lastTrade.salePrice) : 0;

  return (
    <tr className={styles.contractTableRow}>
      <td>{`$${props.contractType.strikePrice}`}</td>
      <td>{`$${props.amountFilter ? (Math.trunc(lastPrice * Number(props.asset.assetAmount) * 1000) / 1000).toFixed(3) : lastPrice.toFixed(2)}`}</td>
      <td>
        {dailyPriceChange === 0 ? 'N/A' :
        <>
        {`$${dailyPriceChange}`}
        <div>{`${((dailyPriceChange! / (lastPrice - dailyPriceChange!)) * 100).toFixed(1)}%`}</div>
        </>
        }
      </td>
      <td onClick={() => setShowModal(true)}>
        {highestBid === null ? 'N/A' :
        <>
        {`$${props.amountFilter ? (Math.trunc(highestBid * Number(props.asset.assetAmount) * 1000) / 1000).toFixed(3) : highestBid.toFixed(2)}`}
        <div>{`(x${bids.length})`}</div>
        </>
        }
      </td>
      <td>
        {lowestAsk === null ? 'N/A' :
        <>
        {`$${props.amountFilter ? (Math.trunc(lowestAsk * Number(props.asset.assetAmount) * 1000) / 1000).toFixed(3) : lowestAsk.toFixed(2)}`}
        <div>{`(x${asks.length})`}</div>
        </>
        }
      </td>
      <td>{dailyTrades.length}</td>
      <td>{contracts.length}</td>
      {showModal &&
      <PlaceBidModal
        key={props.contractType.contractTypeId}
        asset={props.asset}
        contractType={props.contractType}
        defaultBid={lowestAsk || highestBid}
        onClose={() => {
          setShowModal(false);
          getBidsByType();
          getAsks();
          getLastTrade();
          getDailyTrades();
          getDailyPriceChange();
        }}
      />}
    </tr>
  );

};
