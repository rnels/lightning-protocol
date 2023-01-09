'use client';

import * as api from '../../../lib/api_user';
import UserPoolDetails from './UserPoolDetails';

import React, { useState } from 'react';
import Link from 'next/link';
import { Asset } from '../../../lib/types';
import { useRouter } from 'next/navigation';
// import { errorMessage as errorMessageStyle } from '../styles.module.scss';
import styles from '../../styles.module.scss';

/** Renders a list of pools for the logged in user */
export default function UserPoolList(props: {assets: Asset[]}) {

  const [error, setError] = useState('');

  const router = useRouter();

  async function createPool(assetId: number) {
    try {
      await api.createPool(assetId);
      router.refresh(); // TODO: Switch to invalidating cache to force a new fetch(?)
    } catch (e) {
      console.log(e);
      setError('Could not create pool');
    }
  }

  return (
    <div className='user-pool-list'>
      {error && <div className={styles.errorMessage}>{`Error: ${error}`}</div>}
      {props.assets.length > 0 &&
        props.assets.map((asset) =>
        <div key={asset.assetId}>
          <h3><Link href={`/assets/${asset.assetId}`}>{asset.name}</Link></h3>
        {asset.pools ?
          <UserPoolDetails
            key={asset.pools[0].poolId}
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

