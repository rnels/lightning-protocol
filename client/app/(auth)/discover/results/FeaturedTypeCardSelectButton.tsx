'use client';

import * as api from '../../../../lib/api';
import React, { useEffect, useState } from 'react';
import styles from './results.module.scss';
import { ContractType } from '../../../../lib/types';
import useSWR, { useSWRConfig } from 'swr';

export default function FeaturedTypeCardSelectButton(props: {contractType: ContractType}) {

  const [selected, setSelected] = useState<boolean>(false);
  const { cache, mutate, ...extraConfig } = useSWRConfig();

  console.log('render');

  useEffect(() => {
    if (cache.get(props.contractType.contractTypeId.toString())) setSelected(true);
  }, []);

  function handleClick() {
    if (!selected) {
      mutate(
        props.contractType.contractTypeId.toString(), // which cache keys are updated
        props.contractType // update cache data to `contractType`
      );
      setSelected(true);
    } else {
      mutate(
        props.contractType.contractTypeId.toString(), // which cache keys are updated
        undefined // update cache data to `undefined`
      );
      setSelected(false);
    }
  }

  return (
    <button
      onClick={(e) => handleClick()}
      id={selected ? styles.featuredCardSelectButtonSelected : styles.featuredCardSelectButton}
    >
      {selected ? 'Selected' : 'Select'}
    </button>
  );

}

