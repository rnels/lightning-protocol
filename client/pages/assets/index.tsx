import * as api from '../../lib/api';
import { Asset } from '../../lib/types';

import React from 'react';
import { GetServerSideProps } from 'next';

export default function Assets(props: { assetList: Asset[] }) {

  const renderAssets = props.assetList.map((asset) => {
    return (
      <a href={`assets/${asset.assetId}`} key={`asset-name-${asset.assetId}`}>
        {asset.name}
      </a>
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

  let assetList = await api.getAssetList();

  return {
    props: {
      assetList
    }
  }

};
