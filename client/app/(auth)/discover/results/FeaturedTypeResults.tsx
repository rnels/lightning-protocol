import * as api from '../../../../lib/api';
import { cookies } from 'next/headers';
import React from 'react';
import styles from './results.module.scss';
import FeaturedTypeCard from './FeaturedTypeCard';
import FeaturedTypeResultsSelected from './FeaturedTypeResultsSelected';

export default async function FeaturedTypeResults(props: {assetId: string | number, direction: boolean}) {

  const contractTypes = await getFeaturedContractTypes(props.assetId, props.direction);

  return (
    <div className={styles.featuredTypeResults}>
      <div className={styles.featuredTypeResultsScroll}>
        {contractTypes.map((contractType) => {
          {/* @ts-expect-error Server Component */}
          return <FeaturedTypeCard
            contractType={contractType}
          />
        }
        )}
      </div>
      <FeaturedTypeResultsSelected/>
    </div>
  );

}


async function getFeaturedContractTypes(assetId: string | number, direction: boolean) {
  let cookie = cookies().get('lightning-app-cookie');
  let contractTypes = await api.getFeaturedContractTypes(assetId, direction, cookie!.value);
  return contractTypes;
}


