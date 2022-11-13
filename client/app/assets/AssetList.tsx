import React from 'react';
import { Asset } from '../../lib/types';
import Link from 'next/link';

export default function AssetList(props: { assetList: Asset[] }) {

  return (
    <div className='asset-list'>
      {props.assetList.map((asset) => (
        <Link href={`assets/${asset.assetId}`} key={`asset-name-${asset.assetId}`}>
          {asset.name}
        </Link>
      ))}
    </div>

  );
};