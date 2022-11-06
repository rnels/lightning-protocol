import * as api from '../../lib/api';

import { useEffect, useState } from 'react';

// TODO: Have this updated on a regular basis
export default function AssetPrice(props: {assetId: number}) {

  const [assetPrice, setAssetPrice] = useState<number | string>('N/A');

  useEffect(() => {
    api.getAssetPrice(props.assetId)
      .then((price) => setAssetPrice(price))
      .catch((errorRes) => {
        console.log(errorRes);
        setAssetPrice('N/A');
      });
  }, [props.assetId]);

    return (
      <div className="asset-asset-price">
        {assetPrice}
      </div>

    );
};
