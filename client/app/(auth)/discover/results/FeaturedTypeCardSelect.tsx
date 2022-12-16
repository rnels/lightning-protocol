'use client';

import * as api from '../../../../lib/api';
import React, { useState } from 'react';
import styles from './results.module.scss';
import { ContractType } from '../../../../lib/types';

export default function FeaturedTypeCardSelect(props: {contractType: ContractType}) {

  const [selected, setSelected] = useState<boolean>(false);

  function handleClick() {
    setSelected(!selected);
  }

  return (
    <button
      onClick={(e) => handleClick()}
      id={selected ? styles.featuredCardSelectButtonSelected : styles.featuredCardSelectButton}
    >
      Select
    </button>
  );

}
