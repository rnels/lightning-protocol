import React from 'react';
import styles from './discover.module.scss';
import BadgedTypeResults from './BadgedTypeResults';

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
    <div className='discover-results-page'>
      <h2>Discover Results</h2>
      {/* @ts-expect-error Server Component */}
      <BadgedTypeResults
        assetId={assetId as string}
        direction={boolDirection}
      />
    </div>
  );

}
