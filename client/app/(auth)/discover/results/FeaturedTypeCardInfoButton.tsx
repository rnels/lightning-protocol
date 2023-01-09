'use client';

import React, { useState } from 'react';
import InfoIconClient from './InfoIconClientWrapped';
import { ContractType } from '../../../../lib/types';

const badgeMap: any = {
  potential: {
    text: '👀 High Potential',
    color: '#C9FFD8'
  },
  safe: {
    text: '🔒 Safe Play',
    color: '#C9FFF8'
  },
  wild: {
    text: '🃏 Wildcard',
    color: '#E1C9FF'
  }
};

export default function FeaturedTypeCardInfoButton(props: {contractType: ContractType}) {

  const [active, setActive] = useState<boolean>(false);

  function handleClick() {
    setActive(!active);
  }

  return (
    <div onClick={(e) => handleClick()}>
      <InfoIconClient
        bgColor={props.contractType.badge ? badgeMap[props.contractType.badge!].color : '#F4E3A6'}
      />
    </div>
  );

}
