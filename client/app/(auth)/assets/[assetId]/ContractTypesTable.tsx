'use client';

import styles from '../assets.module.scss';

import { useState } from 'react';
import { Asset, ContractType } from '../../../../lib/types';
import ContractTableRow from './ContractTableRow';

/** Renders a table of contract types */
export default function ContractTypesTable(
  props: {
    rowsData: {
      contractType: ContractType,
      lastPrice: number,
      dailyPriceChange: number,
      highestBid: number | null,
      bidAmount: number,
      lowestAsk: number | null,
      askAmount: number,
      volume: number,
      openInterest: number
    }[],
    asset: Asset
  }
) {

  const [directionFilter, setDirectionFilter] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<string>(props.rowsData[0].contractType.expiresAt);
  const [amountFilter, setAmountFilter] = useState<boolean>(false);

  // TODO: Ensure the time zone conversion works
  const dateFilterList = props.rowsData
    .map((rowData) => rowData.contractType.expiresAt)
    .filter((expiry: string, i: number, expiryArray: string[]) => expiryArray.indexOf(expiry) === i);

  const filteredRowsData = props.rowsData
    .filter((rowData => rowData.contractType.expiresAt === dateFilter && rowData.contractType.direction === directionFilter))
    .sort((typeA, typeB) => Number(typeB.contractType.strikePrice) - Number(typeA.contractType.strikePrice));

  return (
    <div className='contract-types-table'>
      <form
        className='contract-types-table-filters'
        onSubmit={(e) => e.preventDefault()}
      >
        <label className='contract-types-table-filter-expiry'>
          Expiry
          <select
            onChange={(e) => setDateFilter(e.target.value)}
            value={dateFilter}
          >
            {dateFilterList.map((filter) =>
              <option
                key={filter}
                value={filter}
              >
                {new Date(filter).toLocaleDateString('en-us', { year:'numeric', month:'short', day:'numeric' })}
              </option>
            )}
          </select>
        </label>
        <button
            onClick={() => setAmountFilter(!amountFilter)}
        >{amountFilter ? 'Show Price' : 'Show Cost'}</button>
        <div className='contract-types-table-filter-direction'>
          <button
            onClick={() => setDirectionFilter(true)}
          >Calls</button>
          <button
            onClick={() => setDirectionFilter(false)}
          >Puts</button>
        </div>
      </form>
      <div className={styles.tableContracts}>
      <table>
        <thead className='fixed'>
          <tr>
            <th>Strike</th>
            <th>{amountFilter ? 'Last Cost' : 'Last Price'}</th>
            <th>Change</th>
            <th>{amountFilter ? 'Bid Cost' : 'Bid Price'}</th>
            <th>{amountFilter ? 'Ask Cost' : 'Ask Price'}</th>
            <th>Volume</th>
            <th>OI</th>
          </tr>
        </thead>
        <tbody>
        {filteredRowsData.map((rowData) =>
          <ContractTableRow
            key={rowData.contractType.contractTypeId}
            rowData={rowData}
            asset={props.asset}
            amountFilter={amountFilter}
          />
        )}
        </tbody>
      </table>
      </div>
    </div>
  );

};
