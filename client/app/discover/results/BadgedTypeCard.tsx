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

// TODO: Create conditionals to check whether card has badge(s)
// If not, border color should be a default solid color and there should be no badge div element(s)

// TODO: Try a different layout with badges bannered on the top left
// Use an absolute positioned div (see #discoverFormSearch) and within that div,
// run contractType.badges.map and create as many elements as there are badges,
// spaced vertically from one another
export default async function BadgedTypeCard(props: {contractType: ContractType}) {

  const assetPrice = await getAssetPrice(props.contractType.assetId);
  let priceDif = (Number(props.contractType.strikePrice) - assetPrice) / assetPrice;
  let daysDif = Math.trunc((new Date(props.contractType.expiresAt).getTime() - Date.now()) / 86400000);

  return (
    <div
      className={styles.resultsComponent}
      style={{ // TODO: Set a conditional if badges && badges.length > 1, create a gradient color between badge colors (need to check how to set a border gradient)
        outlineColor: badgeMap[props.contractType.badges![0] as string].color
      }}
    >
      <div className={styles.resultsComponentBadgesTopArea}>
        {props.contractType.badges?.map((badge) =>
          <div
          className={styles.resultsComponentBadgeAlt}
          style={{
            backgroundColor: badgeMap[badge].color
          }}
          >{badgeMap[badge].text}</div>
        )}
      </div>
      <div className={styles.resultsComponentInner}>
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
        {/* {props.contractType.badges?.map((badge) =>
          <div
          className={styles.resultsComponentBadge}
          style={{
            backgroundColor: badgeMap[badge].color
          }}
          >{badgeMap[badge].text}</div>
        )} */}
        <button>Add</button>
      </div>
    </div>
  );

}

async function getAssetPrice(assetId: number) {
  let cookie = cookies().get('lightning-app-cookie');
  let price = await api.getAssetPrice(assetId, cookie!.value);
  return price;
}