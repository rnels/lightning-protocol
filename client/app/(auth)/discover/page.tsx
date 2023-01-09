import * as api from '../../../lib/api_client';
import React from 'react';
import DiscoverForm from './DiscoverForm';

export default async function DiscoverPage() {

  const assetList = await getAssetList();

  return (
    <div className='discover-page'>
      <h2>Discover</h2>
      <DiscoverForm
        assets={assetList}
      />
    </div>
  );

}

async function getAssetList() {
  let assetList = await api.getAssetList();
  return assetList;
}

