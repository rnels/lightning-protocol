
import styles from './assets.module.css';
import * as api from '../../lib/api';
import { cookies } from 'next/headers';

// NOTE: This is not currently being used anywhere
export default async function AssetPriceHistory(props: {assetId: number}) {

  const assetPriceHistory = await getAssetPriceHistory(props.assetId);

  return (
    <div className={styles.assetPrice}>
      {`$${Number(assetPriceHistory[0].price).toFixed(2)}`}
    </div>
  );

}

async function getAssetPriceHistory(assetId: string | number, days=7) {
  let cookie = cookies().get('lightning-app-cookie');
  let assetPriceHistory = await api.getAssetPriceHistory(assetId, days, cookie!.value);
  return assetPriceHistory;
}
