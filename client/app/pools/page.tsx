'use client';

import * as api from '../../lib/api';
import UserPoolDetails from './UserPoolDetails';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Asset } from '../../lib/types';

/** Renders a list of pools for the logged in user */
export default function UserPoolsPage() {

  const [assets, setAssets] = useState<Asset[]>();

  useEffect(() => {
    if (assets) return;
    api.getAssetListOwnedExt()
    .then((res) => setAssets(res));
  }, []);

  async function createPool(assetId: number) {
    try {
      await api.createPool(assetId)
      let res = await api.getAssetListOwnedExt();
      setAssets(res);
    } catch (e) {
      console.log(e);
    }
  }

  if (!assets) return null;

  return (
    <div className='user-pools-page'>
      <h2>My Pools</h2>
      {assets.length > 0 &&
        assets.map((asset) =>
        <div key={asset.assetId}>
          <h3><Link href={`/assets/${asset.assetId}`}>{asset.name}</Link></h3>
        {asset.pools ?
          <UserPoolDetails
            key={asset.assetId}
            pool={asset.pools[0]}
          />
          :
          <button onClick={() => createPool(asset.assetId)}>
            Create
          </button>
        }
        </div>
        )
      }
    </div>
  );

}

