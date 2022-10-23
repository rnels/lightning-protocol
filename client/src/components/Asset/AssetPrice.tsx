import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { serverURL } from '../../config';

// TODO: Have this updated on a regular basis
export default function AssetPrice(props: {assetId: number}) {

  const [assetPrice, setAssetPrice] = useState<number | string>('N/A');

  useEffect(() => {
    axios.get(`${serverURL}/asset/price`, {
      params: {
        id: props.assetId
      }
    })
      .then((response) => {
        setAssetPrice(response.data.asset.price);
      })
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
