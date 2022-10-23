import { Asset } from "../../lib/types";
import AssetName from "./AssetName";
import AssetPrice from "./AssetPrice";
import AssetSymbol from "./AssetSymbol";

export default function AssetDetails(props: {asset: Asset}) {
    return (
      <div className="asset-details">
        <h2>Assets</h2>
        {props.asset.iconUrl &&
          <img
            src={props.asset.iconUrl}
            alt={`${props.asset.name}-icon`}
            height='100'
            width='100'
          />
        }
        <AssetName
          assetName={props.asset.name}
        />
        <AssetSymbol
          assetSymbol={props.asset.symbol}
        />
        <AssetPrice
          assetId={props.asset.assetId}
        />
      </div>

    );
};
