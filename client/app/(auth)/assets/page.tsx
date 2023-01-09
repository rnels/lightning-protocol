import * as api from '../../../lib/api_client';
import styles from './assets.module.scss';

import React from 'react';
import AssetList from './AssetList';

export default async function AssetsPage() {

  const assetList = await getAssetList();

  return (
    <div className={styles.assetPage}>
      <h2>All Assets</h2>
      <AssetList
        assetList={assetList}
      />
    </div>
  );

}

async function getAssetList() {
  let assetList = await api.getAssetList();
  return assetList;
}
