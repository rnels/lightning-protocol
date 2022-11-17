import * as api from '../../lib/api';

import React from 'react';
import AssetList from './AssetList';
import { cookies } from 'next/headers';

export default async function AssetsPage() {

  const assetList = await getAssetList();

  return (
    <div className='assets-page'>
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
