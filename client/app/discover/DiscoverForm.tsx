'use client';

import React, { useState } from 'react';
import styles from './discover.module.scss';
import { Asset } from '../../lib/types';
import { useRouter } from 'next/navigation';

// TODO: This will be the page where users are recommended contracts based on their sentiment
export default function DiscoverForm(props: {assets: Asset[]}) {

  // const [assetIdSelected, setAssetIdSelected] = useState<number>();
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>();
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [listVisible, setListVisible] = useState<boolean>(false);
  const [selectedDirection, setSelectedDirection] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<string>('');

  const router = useRouter();

  function onSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchInput(e.target.value);
    setSelectedAsset(null);
    if (e.target.value.length === 0) return setAssetList([]);
    if (!listVisible) setListVisible(true);
    let searchInput = e.target.value.toLowerCase();
    let matchedAssets = props.assets.filter((asset) => asset.name.toLowerCase().includes(searchInput));
    setAssetList(matchedAssets);
  }

  function handleSubmit() {
    // TODO: Placeholder functionality until new page is created
    if (!selectedAsset) return;
    router.push(`/assets/${selectedAsset.assetId}`)
  }

  let assetListElements = assetList.map((asset) =>
    <li
      key={asset.assetId}
      onClick={() => {
        setSelectedAsset(asset);
        setSearchInput(asset.name);
        setListVisible(false);
      }}
    >
      {asset.name}
    </li>
  );

  return (
    <div className={styles.discoverFormComponent}>
      <form className={styles.discoverForm}>
        <label>
          The price of
          <div id={styles.discoverFormSearch}>
            <input
              type='search'
              value={searchInput}
              onChange={onSearchInput}
              onFocus={() => {
                if (!selectedAsset) setListVisible(true);
              }}
            />
            <ul
              hidden={!listVisible}
            >
              {assetListElements}
            </ul>
          </div>
        </label>
        <label>
          will go
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
          >
            <option
              value=''
              key='default-option'
              disabled
            />
            <option value='up'>up</option>
            <option value='down'>down</option>
          </select>
        </label>
        <label>
          by a
          <select
            value={selectedAmount}
            onChange={(e) => setSelectedAmount(e.target.value)}
          >
            <option
              value=''
              key='default-option'
              disabled
            />
            <option value='little'>little</option>
            <option value='lot'>lot</option>
          </select>
        </label>
      </form>
      <button
        onClick={(e) => handleSubmit()}
        disabled={!selectedAsset || selectedDirection.length === 0 || selectedAmount.length === 0}
      >Discover Options</button>
    </div>
  );

}


