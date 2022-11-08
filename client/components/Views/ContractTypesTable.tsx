import { Asset, ContractType } from '../../lib/types';
import ContractTableRow from './ContractTableRow';

/** Renders a table of contract types */
// TODO: Actually integrate this in the file structure in a way that makes sense
export default function ContractTypesTable(props: {contractTypes: ContractType[], asset: Asset, amountFilter: boolean}) {

  const renderCells = props.contractTypes.map((contractType) =>
    <ContractTableRow
      key={contractType.contractTypeId}
      contractType={contractType}
      asset={props.asset}
      amountFilter={props.amountFilter}
    />
  );

  return (
    <table className='contract-types-table'>
      <thead className='contract-table-header'>
        <tr>
          <th>Strike</th>
          <th>Last</th>
          <th>Change</th>
          <th>{props.amountFilter ? 'Bid Cost' : 'Bid Price'}</th>
          <th>{props.amountFilter ? 'Ask Cost' : 'Ask Price'}</th>
          <th>Volume</th>
          <th>OI</th>
        </tr>
      </thead>
      <tbody>
        {renderCells}
      </tbody>
    </table>
  );

};
