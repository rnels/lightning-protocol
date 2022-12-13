import * as api from '../../../lib/api';
import React from 'react';
import styles from './results.module.scss';
import { ContractType } from '../../../lib/types';
import { cookies } from 'next/headers';

const badgeMap: any = {
  potential: {
    text: '👀 High Potential',
    color: '#C9FFD8'
  },
  safe: {
    text: '🔒 Safe Bet',
    color: '#C9FFF8'
  },
  wild: {
    text: '🃏 Wildcard',
    color: '#E1C9FF'
  }
};

export default async function BadgedTypeCard(props: {contractType: ContractType}) {

  const assetPrice = await getAssetPrice(props.contractType.assetId);
  let priceDif = (Number(props.contractType.strikePrice) - assetPrice) / assetPrice;
  let daysDif = Math.trunc((new Date(props.contractType.expiresAt).getTime() - Date.now()) / 86400000);

  return (
    <div
      className={styles.resultsComponent}
      style={{
        borderColor: badgeMap[props.contractType.badge as string].color
      }}
    >
      <div className={styles.resultsComponentHeaders}>
        <h3
          style={{
            fontWeight: 'bold'
          }}
        >{`$${props.contractType.strikePrice}`}</h3>
        <h3>{new Date(props.contractType.expiresAt).toLocaleDateString('en-us', { month:'long', day:'numeric' })}</h3>
      </div>
      <div className={styles.resultsComponentBubbles}>
        <div
          id={styles.priceBubble}
          style={{
            backgroundColor: props.contractType.direction ? '#DDFFC9' : '#FFC9C9'
          }}
        >{`${props.contractType.direction ? '📈' : '📉'} ${Math.trunc(priceDif * 100)}%`}</div>
        <div id={styles.daysBubble}>{`🕑 ${daysDif}d`}</div>
      </div>
      <div
        className={styles.resultsComponentBadge}
        style={{
          backgroundColor: badgeMap[props.contractType.badge as string].color
        }}
      >{badgeMap[props.contractType.badge as string].text}</div>
      <button>Add</button>
    </div>
  );

}

async function getAssetPrice(assetId: number) {
  let cookie = cookies().get('lightning-app-cookie');
  let price = await api.getAssetPrice(assetId, cookie!.value);
  return price;
}