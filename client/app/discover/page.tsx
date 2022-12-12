import * as api from '../../lib/api';
import { cookies } from 'next/headers';
import React from 'react';
import styles from './discover.module.scss';
import DiscoverForm from './DiscoverForm';

export default async function DiscoverPage() {

  const assetList = await getAssetList();

  return (
    <div className='discover-page'>
      <h2>Discover Contracts</h2>
      <DiscoverForm
        assets={assetList}
      />
    </div>
  );

}

async function getAssetList() {
  let cookie = cookies().get('lightning-app-cookie');
  let assetList = await api.getAssetList(cookie!.value);
  return assetList;
}

