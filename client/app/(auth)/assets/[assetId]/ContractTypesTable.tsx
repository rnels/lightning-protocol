'use client';

import styles from '../assets.module.scss';

import { useState } from 'react';
import { Asset, ContractType } from '../../../../lib/types';
import ContractTableRow from './ContractTableRow';

/** Renders a table of contract types */
export default function ContractTypesTable(props: {contractTypes: ContractType[], asset: Asset}) {

  const [directionFilter, setDirectionFilter] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<string>(props.contractTypes[0].expiresAt);

  const [amountFilter, setAmountFilter] = useState<boolean>(false);

  // TODO: Ensure the time zone conversion works
  const dateFilterList = props.contractTypes
    .map((contractType) => contractType.expiresAt)
    .filter((expiry: string, i: number, expiryArray: string[]) => expiryArray.indexOf(expiry) === i);

  const filteredTypeList = props.contractTypes
    .filter((contractType => contractType.expiresAt === dateFilter && contractType.direction === directionFilter))
    .sort((a, b) => Number(b.strikePrice) - Number(a.strikePrice));

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
        {filteredTypeList.map((contractType) =>
          <>
          {/* @ts-expect-error Server Component */}
          <ContractTableRow
            key={contractType.contractTypeId}
            contractType={contractType}
            asset={props.asset}
            amountFilter={amountFilter}
          />
          </>
        )}
        </tbody>
      </table>
      </div>
    </div>
  );

};
