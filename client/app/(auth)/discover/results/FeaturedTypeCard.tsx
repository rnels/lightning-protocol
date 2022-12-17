'use client';

import React from 'react';
import styles from './results.module.scss';
import { ContractType } from '../../../../lib/types';
import FeaturedTypeCardSelectButton from './FeaturedTypeCardSelectButton';
import FeaturedTypeCardInfoButton from './FeaturedTypeCardInfoButton';

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

// TODO: Figure out if there's any way I can use the SWR provider with nested client components in server components
// Ideally I wanted to keep this route as static as possible
export default function FeaturedTypeCard(props: {contractType: ContractType, assetPrice: number}) {

  let priceDif = (Number(props.contractType.strikePrice) - props.assetPrice) / props.assetPrice;
  let daysDif = Math.trunc((new Date(props.contractType.expiresAt).getTime() - Date.now()) / 86400000);

  return (
    <div
      className={styles.featuredCard}
      style={ props.contractType.badge ? {
        boxShadow: `0px 0px 0px 0.3em ${badgeMap[props.contractType.badge!].color} inset`
      } : {}}
    >
      <div className={styles.featuredCardTop}>
        {props.contractType.badge ?
          <div
            id={styles.featuredCardBadge}
            style={{
              backgroundColor: badgeMap[props.contractType.badge!].color
            }}
          >{badgeMap[props.contractType.badge!].text}</div>
          :
          <div></div>
        }
        <FeaturedTypeCardInfoButton
          contractType={props.contractType}
        />
      </div>
      <div className={styles.featuredCardHeaders}>
        <h3
          style={{
            fontWeight: 'bold'
          }}
        >{`$${props.contractType.strikePrice}`}</h3>
        <h3>{new Date(props.contractType.expiresAt).toLocaleDateString('en-us', { month:'long', day:'numeric' })}</h3>
      </div>
      <div className={styles.featuredCardBubbles}>
        <div
          id={styles.priceBubble}
          style={{
            backgroundColor: props.contractType.direction ? '#DDFFC9' : '#FFC9C9'
          }}
        >{`${props.contractType.direction ? '📈' : '📉'} ${Math.trunc(priceDif * 100)}%`}</div>
        <div id={styles.daysBubble}>{`🕑 ${daysDif}d`}</div>
      </div>
      <FeaturedTypeCardSelectButton
        contractType={props.contractType}
      />
    </div>
  );

}
