import * as api from '../lib/api';
import { Asset, Pool } from '../lib/types';
import UserPoolDetails from '../components/Pool/UserPoolDetails';

import { useEffect, useState } from 'react';
import React from 'react';
import { GetServerSideProps } from 'next';

/** Renders a list of pools for the logged in user */
export default function UserPools(props: { assets: Asset[] }) {

  return (
    <div className='user-pools-page'>
      <h2>My Pools</h2>
      {props.assets.length > 0 &&
        props.assets.map((asset) =>
        <div key={asset.assetId}>
          <h3><a href={`/assets/${asset.assetId}`}>{asset.name}</a></h3>
          <UserPoolDetails
            key={asset.assetId}
            pool={asset.pools![0]}
          />
        </div>
        )
      }
    </div>
  );

};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let cookie = context.req.cookies['lightning-app-cookie'];

  let assets: any[] = [];
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
