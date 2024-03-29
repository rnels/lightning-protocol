import styles from './assets.module.scss';
import * as api from '../../../lib/api_client'; // TODO: Ensure that using 'import * as api' instead of destructuring specific methods does not hurt our memory usage by loading the entire api.ts file every time

import AssetPriceHistoryCanvas from './AssetPriceHistoryCanvas';

export default async function AssetPriceInfo(props: {assetId: number}) {

  let res = await Promise.all([
    getAssetPrice(props.assetId),
    getAssetPriceHistory(props.assetId)
  ]);
  const assetPrice = res[0];
  const priceHistory = res[1];

  let yesterdayPrice = Number(priceHistory[0].price);
  let priceDif = assetPrice - yesterdayPrice;
  let priceDifPercentage = priceDif / yesterdayPrice;
  let priceStyle = priceDifPercentage > 0;

  return (
    <div className={styles.assetPriceInfo}>
      <AssetPrice
        assetPrice={assetPrice}
      />
      <div
        id={priceStyle ? styles.positivePrice : styles.negativePrice}
      >
        {`${priceStyle ? '+' : ''}${(priceDifPercentage * 100).toFixed(2)}%`}
      </div>
      <AssetPriceHistoryCanvas
        priceHistory={priceHistory}
        priceStyle={priceStyle}
      />
    </div>
  );

}

function AssetPrice(props: {assetPrice: number}) {

  return (
    <div className={styles.assetPrice}>
      {`$${props.assetPrice.toFixed(2)}`}
    </div>
  );

}

async function getAssetPrice(assetId: number) {
  let price = await api.getAssetPrice(assetId);
  return price;
}

async function getAssetPriceHistory(assetId: string | number, days=7): Promise<{ price: string | number; dataPeriod: string; }[]> {
  let assetPriceHistory = await api.getAssetPriceHistory(assetId, days);
  return assetPriceHistory;
}

