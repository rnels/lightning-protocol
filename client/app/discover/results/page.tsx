import React from 'react';
import styles from './results.module.scss';
import FeaturedTypeResults from './FeaturedTypeResults';

export default function DiscoverResultsPage({ searchParams }: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {

  if (!searchParams || !searchParams.asset || !searchParams.d) return null;

  const assetId = searchParams.asset as string;
  const direction = searchParams.d as string; // Direction - Valid values are 'up' or 'down';
  let boolDirection: boolean;
  if (direction.toLowerCase() === 'up') boolDirection = true;
  else boolDirection = false;
  return (
    <div className={styles.discoverResultsPage}>
      <h2>Discover</h2>
      {/* @ts-expect-error Server Component */}
      <FeaturedTypeResults
        assetId={assetId as string}
        direction={boolDirection}
      />
    </div>
  );

}
