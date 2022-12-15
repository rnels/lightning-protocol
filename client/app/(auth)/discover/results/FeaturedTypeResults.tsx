import * as api from '../../../../lib/api';
import { cookies } from 'next/headers';
import React from 'react';
import styles from './results.module.scss';
import FeaturedTypeCard from './FeaturedTypeCard';


export default async function FeaturedTypeResults(props: {assetId: string | number, direction: boolean}) {

  const contractTypes = await getFeaturedContractTypes(props.assetId, props.direction);

  // TODO: Right now the same contract can be returned more than once if it has multiple badges
  // Should do something at the route level to consolidate the badges into string[] instead
  return (
    <div className={styles.featuredTypeResults}>
      {contractTypes.map((contractType) => {
        {/* @ts-expect-error Server Component */}
        return <FeaturedTypeCard
          contractType={contractType}
        />
      }
      )}
    </div>
  );

}


async function getFeaturedContractTypes(assetId: string | number, direction: boolean) {
  let cookie = cookies().get('lightning-app-cookie');
  let contractTypes = await api.getFeaturedContractTypes(assetId, direction, cookie!.value);
  return contractTypes;
}


