import * as api from '../../../lib/api';
import { cookies } from 'next/headers';
import React from 'react';
import styles from './results.module.scss';
import BadgedTypeCard from './BadgedTypeCard';

export default async function BadgedTypeResults(props: {assetId: string | number, direction: boolean}) {

  const contractTypes = await getBadgedContractTypes(props.assetId, props.direction);

  // TODO: Right now the same contract can be returned more than once if it has multiple badges
  // Should do something at the route level to consolidate the badges into string[] instead
  return (
    <div className={styles.badgedTypeResultsComponent}>
      {contractTypes.map((contractType) => {
        {/* @ts-expect-error Server Component */}
        return <BadgedTypeCard
          contractType={contractType}
        />
      }
      )}
    </div>
  );

}


async function getBadgedContractTypes(assetId: string | number, direction: boolean) {
  let cookie = cookies().get('lightning-app-cookie');
  let contractTypes = await api.getBadgedContractTypes(assetId, direction, cookie!.value);
  return contractTypes;
}


