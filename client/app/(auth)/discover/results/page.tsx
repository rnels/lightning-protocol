import React from 'react';
import styles from './results.module.scss';
import FeaturedTypeResults from './FeaturedTypeResults';
import { cookies } from 'next/headers';
import * as api from '../../../../lib/api_client';

// TODO: For some reason this page doesn't want to display anything
// when the build is launched with the start script,
// could have to do with searchParams somehow? Look for bug reports
export default async function DiscoverResultsPage({ searchParams }: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {

  if (!searchParams || !searchParams.a || !searchParams.d) return null;

  const assetId = searchParams.a as string;
  const direction = searchParams.d as string; // Direction - Valid values are 'up' or 'down';
  let boolDirection: boolean;
  if (direction.toLowerCase() === 'up') boolDirection = true;
  else boolDirection = false;
  const contractTypes = await getFeaturedContractTypes(assetId, boolDirection);
  const assetPrice = await getAssetPrice(Number(assetId));

  return (
    <div className={styles.discoverResultsPage}>
      <FeaturedTypeResults
        contractTypes={contractTypes}
        assetPrice={assetPrice}
      />
    </div>
  );

}

async function getFeaturedContractTypes(assetId: string | number, direction: boolean) {
  let cookie = cookies().get('lightning-app-cookie');
  let contractTypes = await api.getFeaturedContractTypes(assetId, direction, cookie!.value);
  return contractTypes;
}

async function getAssetPrice(assetId: number) {
  let cookie = cookies().get('lightning-app-cookie');
  let price = await api.getAssetPrice(assetId, cookie!.value);
  return price;
}