import * as api from '../../lib/api';
import styles from './assets.module.css';

import React from 'react';
import AssetList from './AssetList';
import { cookies } from 'next/headers';

export default async function AssetsPage() {

  const assetList = await getAssetList();

  return (
    <div className={styles.assetPage}>
      <h2>Assets</h2>
      <AssetList
        assetList={assetList}
      />
    </div>
  );

}

async function getAssetList() {
  let cookie = cookies().get('lightning-app-cookie');
  let assetList = await api.getAssetList(cookie!.value);
  return assetList;
}
