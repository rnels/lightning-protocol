
import styles from './assets.module.scss';
import * as api from '../../../lib/api_client';

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
  let assetPriceHistory = await api.getAssetPriceHistory(assetId, days);
  return assetPriceHistory;
}
