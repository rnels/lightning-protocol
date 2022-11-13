import * as api from '../../lib/api';
import { Asset } from '../../lib/types';

import React from 'react';
import { GetServerSideProps } from 'next';
import AssetList from './AssetList';

export default function AssetsPage(props: { assetList: Asset[] }) {

  return (
    <div className='assets-page'>
      <h2>Assets</h2>
      <AssetList
        assetList={props.assetList}
      />
      </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let cookie = context.req.cookies['lightning-app-cookie'];

  let assetList: Asset[] = [];
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
