import styles from '../assets.module.scss';
import { Asset, Bid, Contract, ContractType, Trade } from '../../../../lib/types';
import * as api from '../../../../lib/api_client';

import PlaceBidModal from './PlaceBidModal';
import PlaceBidTD from './PlaceBidTD';

/** Renders a row of data for the given ContractType */
export default async function ContractTableRow(props: {contractType: ContractType, asset: Asset, amountFilter: boolean}) {

  const contracts = props.contractType.contracts!;
  const [
    asks,
    lastTrade,
    dailyTrades,
    dailyPriceChange
  ] = await Promise.all([
      api.getAsks(props.contractType.contractTypeId).catch(() => []),
      api.getLastTrade(props.contractType.contractTypeId).catch(() => {}),
      api.getDailyTrades(props.contractType.contractTypeId).catch(() => []),
      api.getDailyPriceChange(props.contractType.contractTypeId).catch(() => 0)
    ]);
  const askPrices = asks.map((ask) => Number(ask.askPrice));
  const lowestAsk = askPrices.length > 0 ? Math.min(...askPrices) : null;
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
      <PlaceBidTD
        contractType={props.contractType}
        asset={props.asset}
        amountFilter={props.amountFilter}
        lowestAsk={lowestAsk}
      />
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
    </tr>
  );

};
