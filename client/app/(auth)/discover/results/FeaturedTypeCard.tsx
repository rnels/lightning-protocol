import * as api from '../../../../lib/api';
import React from 'react';
import styles from './results.module.scss';
import { ContractType } from '../../../../lib/types';
import { cookies } from 'next/headers';
import FeaturedTypeCardSelect from './FeaturedTypeCardSelect';
import FeaturedTypeCardInfo from './FeaturedTypeCardInfo';

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

export default async function FeaturedTypeCard(props: {contractType: ContractType}) {

  const assetPrice = await getAssetPrice(props.contractType.assetId);
  let priceDif = (Number(props.contractType.strikePrice) - assetPrice) / assetPrice;
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
        <FeaturedTypeCardInfo
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
      {/* {props.contractType.badges?.map((badge) =>
        <div
        className={styles.featuredCardBadge}
        style={{
          backgroundColor: badgeMap[badge].color
        }}
        >{badgeMap[badge].text}</div>
      )} */}
      <FeaturedTypeCardSelect
        contractType={props.contractType}
      />
    </div>
  );

}

async function getAssetPrice(assetId: number) {
  let cookie = cookies().get('lightning-app-cookie');
  let price = await api.getAssetPrice(assetId, cookie!.value);
  return price;
}