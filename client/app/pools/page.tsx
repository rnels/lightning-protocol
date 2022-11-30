import * as api from '../../lib/api';

import React from 'react';
import { cookies } from 'next/headers';
import UserPoolList from './UserPoolList';

export default async function UserPoolsPage() {

  const assets = await getAssets();

  return (
    <div className='user-pools-page'>
      <h2>My Pools</h2>
      <UserPoolList
        assets={assets}
      />
    </div>
  );

}

async function getAssets() {
  let cookie = cookies().get('lightning-app-cookie');
  let assetList = await api.getAssetListOwnedExt(cookie!.value);
  return assetList;
}
