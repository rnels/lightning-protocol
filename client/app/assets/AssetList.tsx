import styles from './assets.module.scss';
import React from 'react';
import { Asset } from '../../lib/types';
import AssetDetails from './AssetDetails';

export default function AssetList(props: { assetList: Asset[] }) {

  return (
    <div className={styles.assetList}>
      {props.assetList.map((asset) => (
        <AssetDetails
          key={asset.assetId}
          asset={asset}
        />
      ))}
    </div>
  );

}
