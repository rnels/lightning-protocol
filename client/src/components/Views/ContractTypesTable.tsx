import { ContractType } from '../../lib/types';

import ContractTableCell from './ContractTableRow';


/** Renders a table of contract types */
// TODO: Actually integrate this in the file structure in a way that makes sense
export default function ContractTypesTable(props: {contractTypes: ContractType[]}) {

  const renderCells = props.contractTypes.map((contractType) =>
    <ContractTableCell
      key={contractType.contractTypeId}
      contractType={contractType}
    />
  );

    return (
      <table className="contract-types-table">
        <thead className="contract-table-header">
          <tr>
            <th>Amount</th>
            <th>Strike</th>
            <th>Last</th>
            <th>Change</th>
            <th>Bid</th>
            <th>Ask</th>
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
