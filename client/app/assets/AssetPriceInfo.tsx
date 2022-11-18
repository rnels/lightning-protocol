
import styles from './assets.module.css';
import * as api from '../../lib/api'; // TODO: Ensure that using 'import * as api' instead of destructuring specific methods does not hurt our memory usage by loading the entire api.ts file every time
import { cookies } from 'next/headers';

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

  return (
    <div className={styles.assetPriceInfo}>
      <AssetPrice
        assetPrice={assetPrice}
      />
      <div>
        {`${priceDifPercentage > 0 ? '+' : ''}${(priceDifPercentage * 100).toFixed(2)}%`}
      </div>
      {/* <AssetPriceHistoryGraph
        priceHistory={priceHistory}
      /> */}
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

// TODO: Make this a graph
function AssetPriceHistoryGraph(
  props: {
    priceHistory: {
      price: string | number,
      dataPeriod: string
    }[]
  }
) {

  return (
    <div className={styles.assetPriceHistoryGraph}>
      {`$${Number(props.priceHistory[0].price).toFixed(2)}`}
    </div>
  );

}

async function getAssetPrice(assetId: number) {
  let cookie = cookies().get('lightning-app-cookie');
  let price = await api.getAssetPrice(assetId, cookie!.value);
  return price;
}

async function getAssetPriceHistory(assetId: string | number, days=7): Promise<{ price: string | number; dataPeriod: string; }[]> {
  let cookie = cookies().get('lightning-app-cookie');
  let assetPriceHistory = await api.getAssetPriceHistory(assetId, days, cookie!.value);
  return assetPriceHistory;
}
