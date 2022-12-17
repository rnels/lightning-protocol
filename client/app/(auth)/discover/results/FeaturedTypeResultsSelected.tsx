'use client';

import * as api from '../../../../lib/api';
import React, { useEffect, useState } from 'react';
import styles from './results.module.scss';
import { ContractType } from '../../../../lib/types';
import { useSWRConfig, Cache } from 'swr'

export default function FeaturedTypeResultsSelected() {

  // TODO: Create a modal that opens when button is clicked
  const { cache, mutate, ...extraConfig } = useSWRConfig();
  const [open, setOpen] = useState<boolean>(false);

  let iterator = cache.keys();
  let featuredTypeList = [];

  console.log('render');
  let nextValue = iterator.next().value;
  while (nextValue) {
    featuredTypeList.push(
      cache.get(nextValue)
    );
    nextValue = iterator.next().value;
  }

  function handleClick() {
    setOpen(true);
  }

  // console.log(cache);

  return (
    <div className={styles.featuredTypeResultsSelected}>
      <button
        id={styles.featuredTypeResultsReviewButton}
        onClick={(e) => handleClick()}
      >
        Review
      </button>
      {`${featuredTypeList.length} Selected`}
    </div>
  );

}
