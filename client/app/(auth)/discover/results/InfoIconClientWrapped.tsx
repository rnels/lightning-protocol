'use client';

import InfoIcon from '@mui/icons-material/Info';
import styles from './results.module.scss';
import React from 'react';

export default function InfoIconClient(props: { bgColor: string }) {

  return (
    <InfoIcon
      style={{
        backgroundColor: props.bgColor
      }}
      id={styles.featuredCardInfoIcon}
    />
  );

}
