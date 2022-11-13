import * as api from '../lib/api';
import { Asset, Pool } from '../lib/types';
import UserPoolDetails from '../components/Pool/UserPoolDetails';

import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';

/** Renders a list of pools for the logged in user */
export default function UserPools(props: { assets: Asset[] }) {

  const [assets, setAssets] = useState(props.assets);

  async function createPool(assetId: number) {
    try {
      await api.createPool(assetId)
      setAssets(await api.getAssetListOwnedExt());
    } catch (e) {
      console.log(e);
     }
  }

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

};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let cookie = context.req.cookies['lightning-app-cookie'];

  let assets: Asset[] = [];

  try {
    assets = await api.getAssetListOwnedExt(cookie);
    return { props: { assets } };
  } catch (e) {
    console.log(e);
    return {
      props: {
        assets: []
      }
    };
  }
};
