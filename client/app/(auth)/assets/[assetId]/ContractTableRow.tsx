import { Asset, ContractType } from '../../../../lib/types';
import styles from '../assets.module.scss';
import PlaceBidTD from './PlaceBidTD';

/** Renders a row of data for the given ContractType */
// TODO: Find out why this seems to be rendering on the client instead of the server
export default function ContractTableRow(props: {
  rowData: {
    contractType: ContractType,
    lastPrice: number,
    dailyPriceChange: number,
    highestBid: number | null,
    bidAmount: number,
    lowestAsk: number | null,
    askAmount: number,
    volume: number,
    openInterest: number
  },
  asset: Asset,
  amountFilter: boolean
}) {

  return (
    <tr className={styles.contractTableRow}>
      <td>{`$${props.rowData.contractType.strikePrice}`}</td>
      <td>{`$${props.amountFilter ? (Math.trunc(props.rowData.lastPrice * Number(props.asset.assetAmount) * 1000) / 1000).toFixed(3) : props.rowData.lastPrice.toFixed(2)}`}</td>
      <td>
        {props.rowData.dailyPriceChange === 0 ? 'N/A' :
        <>
        {`$${props.rowData.dailyPriceChange}`}
        <div>{`${((props.rowData.dailyPriceChange! / (props.rowData.lastPrice - props.rowData.dailyPriceChange!)) * 100).toFixed(1)}%`}</div>
        </>
        }
      </td>
      <PlaceBidTD
        contractType={props.rowData.contractType}
        asset={props.asset}
        amountFilter={props.amountFilter}
        highestBid={props.rowData.highestBid}
        lowestAsk={props.rowData.lowestAsk}
      />
      <td>
        {props.rowData.lowestAsk === null ? 'N/A' :
        <>
        {`$${props.amountFilter ? (Math.trunc(props.rowData.lowestAsk * Number(props.asset.assetAmount) * 1000) / 1000).toFixed(3) : props.rowData.lowestAsk.toFixed(2)}`}
        <div>{`(x${props.rowData.askAmount})`}</div>
        </>
        }
      </td>
      <td>{props.rowData.volume}</td>
      <td>{props.rowData.openInterest}</td>
    </tr>
  );

};
