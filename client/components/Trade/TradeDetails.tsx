import { useEffect, useState } from 'react';
import React from 'react';
import * as api from '../../lib/api';

import { ContractType, Trade } from '../../lib/types';
import ContractTypeDetails from '../Contract/ContractType/ContractTypeDetails';
import TradeSalePrice from './TradeSalePrice';
import TradeSaleCost from './TradeSaleCost';
import TradeCreatedAt from './TradeCreatedAt';
import TradeType from './TradeType';

export default function TradeDetails(props: {trade: Trade}) {

  console.log(props.trade);

  const [contractType, setContractType] = useState<ContractType>();

  useEffect(() => {
    api.getContractType(props.trade.typeId)
      .then((ct) => setContractType(ct))
      .catch((error) => console.log(error));
  }, []);

  if (!props.trade || !contractType) return null;

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
        contractType={contractType}
      />
    </div>
  );

};
