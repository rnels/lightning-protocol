'use client';

import * as api from '../../../../lib/api';
import React, { useState } from 'react';
import styles from './results.module.scss';
import { ContractType } from '../../../../lib/types';

export default function FeaturedTypeResultsSelected() {

  // TODO: Use SWR in conjunction with FeaturedTypeCardSelect() to add the contractTypes to a "cart"

  // TODO: Create a modal that opens when button is clicked

  const [selectedList, setSelectedList] = useState<ContractType[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  function handleClick() {
    setOpen(true);
  }

  return (
    <div className={styles.featuredTypeResultsSelected}>
      <button
        id={styles.featuredTypeResultsReviewButton}
        onClick={(e) => handleClick()}
      >
        Review
      </button>
      {/* {`(x) Selected`} */}
    </div>
  );

}
