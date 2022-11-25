import styles from './assets.module.scss';
import React from 'react';
import { Asset } from '../../lib/types';
import AssetName from "./AssetName";
import AssetPriceInfo from "./AssetPriceInfo";
import Link from 'next/link';

export default function AssetDetails(props: {asset: Asset}) {

  return (
    <Link href={`assets/${props.asset.assetId}`} key={`asset-${props.asset.assetId}`}>
    <div
      className={styles.assetDetails}
      // TODO: 'Bump' the bg image on hover
      style={{
        backgroundImage: `url('${props.asset.iconUrl}')`
      }}
    >
      <AssetName
        name={props.asset.name}
      />
      {/* @ts-expect-error Server Component */}
      <AssetPriceInfo
        assetId={props.asset.assetId}
      />
    </div>
    </Link>
  );

}
