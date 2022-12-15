import { ContractType } from "../../../lib/types";
import ContractTypeDirection from "./ContractTypeDirection";
import ContractTypeStrikePrice from "./ContractTypeStrikePrice";
import ContractTypeExpiresAt from "./ContractTypeExpiresAt";

// NOTE: This doesn't require SWR since the type details should be static
export default function ContractTypeDetails(props: {contractType: ContractType}) {

  return (
    <div className='contract-type-details'>
      <ContractTypeDirection
        direction={props.contractType.direction}
      />
      <ContractTypeStrikePrice
        strikePrice={props.contractType.strikePrice}
      />
      <ContractTypeExpiresAt
        expiresAt={props.contractType.expiresAt}
      />
      {props.contractType.badge && props.contractType.badge}
    </div>
  );

};
