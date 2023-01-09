import styles from '../assets.module.scss';

import React from 'react';

import * as api from '../../../../lib/api_client';
import ContractTypesTable from './ContractTypesTable';

export default async function AssetContractsPage( { params }: { params: { assetId: string }} ) {

  const {
    asset,
    assetPrice,
    assetPriceHistory, // TODO: Implement assetPriceHistory
    poolAssetAmount,
    poolLockAssetAmount,
    contractTypeList
  } = await getPropsData(params.assetId);

  return (
    <div className='asset-contracts-page'>
      <h2 className={styles.contractsPageHeader}>
        {`${asset.name} ($${asset.symbol})`}
      </h2>
      <div>{`Price: $${assetPrice >= 1 ? assetPrice.toFixed(2) : assetPrice.toFixed(4)}`}</div>
      <div>{`Lot Size: ${asset.assetAmount} ${asset.symbol}`}</div>
      <div>
        {`Pooled: ${poolAssetAmount || 0} ${asset.symbol}
          (${(poolAssetAmount && poolLockAssetAmount) ? Math.floor(100 * (poolLockAssetAmount / poolAssetAmount)) : 0}% Backing)
        `}
      </div>
      <ContractTypesTable
        contractTypes={contractTypeList}
        asset={asset}
      />
    </div>
  );

}

async function getPropsData(assetId: string | number) {

  let results = await Promise.all([
    api.getAsset(assetId),
    api.getAssetPrice(assetId),
    api.getAssetPriceHistory(assetId, 7),
    api.getPoolAssetAmountByAssetId(assetId),
    api.getPoolLockAssetAmountByAssetId(assetId),
    api.getContractTypesByAssetIdExt(assetId)
  ]);

  return {
    asset: results[0],
    assetPrice: results[1],
    assetPriceHistory: results[2],
    poolAssetAmount: results[3],
    poolLockAssetAmount: results[4],
    contractTypeList: results[5]
  }

}

// export async function generateStaticParams() {

//   console.log('generate')

//   const assets = await api.getAssetList();
//   return assets.map((asset) => ({
//     assetId: asset.assetId
//   }));

// }
