import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { Bid, Contract, ContractType, Trade } from '../../lib/types';
import { serverURL } from '../../config';

/** Renders a row of data for the given ContractType */
// TODO: Actually integrate this in the file structure in a way that makes sense
export default function ContractTableRow(props: {contractType: ContractType}) {

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [asks, setAsks] = useState<{askPrice: number, contractId: number}[]>([]);
  const [lastTrade, setLastTrade] = useState<Trade>();
  const [dailyTrades, setDailyTrades] = useState<Trade[]>([]);
  const [dailyPriceChange, setDailyPriceChange] = useState<number>();

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

  }, [props.contractType]);

  let askPrices = asks.map((ask) => ask.askPrice);
  const lowestAsk = askPrices.length > 0 ? Math.min(...askPrices) : 'N/A';
  let bidPrices = bids.map((bid) => bid.bidPrice);
  const highestBid = bidPrices.length > 0 ? Math.max(...bidPrices) : 'N/A';
  const lastPrice = lastTrade ? lastTrade.salePrice : 0;
  return (
    <tr className="contract-table-row">

      <td>{props.contractType.assetAmount}</td>
      <td>{`$${props.contractType.strikePrice}`}</td>
      <td>{`$${lastPrice}`}</td>
      <td>{`$${dailyPriceChange}`}</td>
      <a href={`${props.contractType.assetId}/bid/${props.contractType.contractTypeId}`}>
      <td>{highestBid === 'N/A' ? highestBid : `$${highestBid}`}</td>
      </a>
      <td>{lowestAsk === 'N/A' ? lowestAsk : `$${lowestAsk}`}</td>
      <td>{dailyTrades.length}</td>
      <td>{contracts.length}</td>

    </tr>
  );
};
