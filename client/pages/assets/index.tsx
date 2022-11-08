import * as api from '../../lib/api';
import { Asset } from '../../lib/types';

import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';

export default function Assets(props: { assetList: Asset[] }) {

  const renderAssets = props.assetList.map((asset) => {
    return (
      <Link href={`assets/${asset.assetId}`} key={`asset-name-${asset.assetId}`}>
        {asset.name}
      </Link>
    );
  });

  return (
    <div className='asset-list'>
      <h2>Assets</h2>
      {renderAssets}
    </div>

  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let cookie = context.req.cookies['lightning-app-cookie'];

  let assetList: any[] = [];
  try {
    assetList = await api.getAssetList(cookie);
    return { props: { assetList } };
  } catch (e) {
    return {
      props: {
        assetList: []
      }
    };
  }
};
