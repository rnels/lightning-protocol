import React from 'react';

import { ContractType, Trade } from '../../../lib/types';
import TradeSalePrice from './TradeSalePrice';
import TradeSaleCost from './TradeSaleCost';
import TradeCreatedAt from './TradeCreatedAt';
import TradeType from './TradeType';
import ContractTypeDetails from '../contracts/ContractTypeDetails';

export default function TradeDetails(props: {trade: Trade, contractType: ContractType}) {

  return (
    <div className='trade-details'>
      <h3>
        Trade Details
      </h3>
      <TradeType
        isBuyer={props.trade.isBuyer}
      />
      <TradeSalePrice
        salePrice={props.trade.salePrice}
      />
      <TradeSaleCost
        saleCost={props.trade.saleCost}
      />
      <TradeCreatedAt
        createdAt={props.trade.createdAt}
      />
      <h4>
        Contract Type
      </h4>
      <ContractTypeDetails
        contractType={props.contractType}
      />
    </div>
  );

}
