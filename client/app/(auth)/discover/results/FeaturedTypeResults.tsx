'use client';

import React from 'react';
import styles from './results.module.scss';
import FeaturedTypeCard from './FeaturedTypeCard';
import FeaturedTypeResultsSelected from './FeaturedTypeResultsSelected';
import { ContractType } from '../../../../lib/types';
import { SWRConfig } from 'swr'
import localStorageProvider from './localStorageProvider';

export default function FeaturedTypeResults(props: {contractTypes: ContractType[], assetPrice: number}) {

  return (
    <SWRConfig
      value={{
        provider: localStorageProvider as any
      }}
    >
      <div className={styles.featuredTypeResults}>
        <div className={styles.featuredTypeResultsScroll}>
          {props.contractTypes.map((contractType) => {
            return <FeaturedTypeCard
              key={contractType.contractTypeId}
              contractType={contractType}
              assetPrice={props.assetPrice}
            />
          }
          )}
        </div>
        <FeaturedTypeResultsSelected
          contractTypes={props.contractTypes}
        />
      </div>
    </SWRConfig>
  );

}
