import React from 'react';
import styles from './results.module.scss';
import FeaturedTypeResults from './FeaturedTypeResults';

// TODO: For some reason this page doesn't want to display anything
// when the build is launched with the start script,
// could have to do with searchParams somehow? Look for bug reports
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
      {/* @ts-expect-error Server Component */}
      <FeaturedTypeResults
        assetId={assetId as string}
        direction={boolDirection}
      />
    </div>
  );

}
