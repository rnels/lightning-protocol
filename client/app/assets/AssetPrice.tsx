
import styles from './assets.module.scss';
import * as api from '../../lib/api';
import { cookies } from 'next/headers';

// TODO: Have this updated on a regular basis
// NOTE: This is not currently being used anywhere
export default async function AssetPrice(props: {assetId: number}) {

  const assetPrice = await getAssetPrice(props.assetId);

  return (
    <div className={styles.assetPrice}>
      {`$${assetPrice.toFixed(2)}`}
    </div>
  );

}

async function getAssetPrice(assetId: number) {
  let cookie = cookies().get('lightning-app-cookie');
  let price = await api.getAssetPrice(assetId, cookie!.value);
  return price;
}
