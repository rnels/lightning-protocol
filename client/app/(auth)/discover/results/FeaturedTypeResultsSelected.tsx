'use client';

import React, { useState } from 'react';
import styles from './results.module.scss';
import { ContractType } from '../../../../lib/types';
import useSWR from 'swr'

export default function FeaturedTypeResultsSelected(props: {contractTypes: ContractType[]}) {

  // TODO: Create a modal that opens when button is clicked
  const [open, setOpen] = useState<boolean>(false);

  function handleClick() {
    setOpen(true);
  }

  // It is unbelievable that this works but it does
  // This creates SWR hooks for all possible contractTypes in the list
  let dataList = [];
  for (let contractType of props.contractTypes) {
    const { data } = useSWR(contractType.contractTypeId.toString());
    data && dataList.push(data);
  }

  return (
    <div className={styles.featuredTypeResultsSelected}>
      <button
        id={styles.featuredTypeResultsReviewButton}
        onClick={(e) => handleClick()}
      >
        Review
      </button>
      {`${dataList.length} Selected`}
    </div>
  );

}
