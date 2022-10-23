export default function ContractTypeAssetAmount(props: {assetAmount: number}) {

    return (
      <div className="contract-type-asset-amount">
        {`Amount: ${props.assetAmount}`}
      </div>

    );
};
