import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { Asset, Bid, Contract, ContractType, Trade } from '../../lib/types';
import { serverURL } from '../../config';
import { Link, Outlet } from 'react-router-dom';
import PlaceBidModal from './PlaceBidModal';

/** Renders a row of data for the given ContractType */
// TODO: Actually integrate this in the file structure in a way that makes sense
export default function ContractTableRow(props: {contractType: ContractType, asset: Asset}) {

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [asks, setAsks] = useState<{askPrice: number, contractId: number}[]>([]);
  const [lastTrade, setLastTrade] = useState<Trade>();
  const [dailyTrades, setDailyTrades] = useState<Trade[]>([]);
  const [dailyPriceChange, setDailyPriceChange] = useState<number>();

  const [showModal, setShowModal] = useState<boolean>(false);

  function getBids() {
    axios.get(`${serverURL}/bid/type`, {
      params: {
        typeId: props.contractType.contractTypeId
      }
    })
      .then((response) => {
        setBids(response.data.bids);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
  }

  useEffect(() => {
    axios.get(`${serverURL}/contract/list`, {
      params: {
        typeId: props.contractType.contractTypeId
      }
    })
      .then((response) => {
        setContracts(response.data.contracts);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
    getBids();
    axios.get(`${serverURL}/contract/type/asks`, {
      params: {
        typeId: props.contractType.contractTypeId
      }
    })
      .then((response) => {
        setAsks(response.data.asks);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
    axios.get(`${serverURL}/trade/last`, {
      params: {
        typeId: props.contractType.contractTypeId
      }
    })
      .then((response) => {
        setLastTrade(response.data.trade);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
    axios.get(`${serverURL}/trade/daily`, {
      params: {
        typeId: props.contractType.contractTypeId
      }
    })
      .then((response) => {
        setDailyTrades(response.data.trades);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
    axios.get(`${serverURL}/trade/daily/change`, {
      params: {
        typeId: props.contractType.contractTypeId
      }
    })
      .then((response) => {
        setDailyPriceChange(response.data.priceChange);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.contractType]);

  let askPrices = asks.map((ask) => ask.askPrice);
  const lowestAsk = askPrices.length > 0 ? Math.min(...askPrices) : null;
  let bidPrices = bids.map((bid) => bid.bidPrice);
  const highestBid = bidPrices.length > 0 ? Math.max(...bidPrices) : null;
  const lastPrice = lastTrade ? lastTrade.salePrice : 0;
  return (
    <tr className="contract-table-row">
      <td>{`$${props.contractType.strikePrice}`}</td>
      <td>{`$${lastPrice}`}</td>
      <td>{`$${dailyPriceChange}`}</td>
      <td onClick={() => setShowModal(true)}>{highestBid === null ? 'N/A' : `$${highestBid}`}</td>
      <td>{lowestAsk === null ? 'N/A' : `$${lowestAsk}`}</td>
      <td>{dailyTrades.length}</td>
      <td>{contracts.length}</td>
      {showModal && <PlaceBidModal
        key={props.contractType.contractTypeId}
        asset={props.asset}
        contractType={props.contractType}
        defaultBid={lowestAsk}
        onClose={() => {
          setShowModal(false);
          getBids();
        }}
      />}
    </tr>
  );
};
