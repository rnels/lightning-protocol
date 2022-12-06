'use client';

// import {
//   modal as modalStyle,
//   modalHeader as modalHeaderStyle
// } from '../styles.module.scss';
import styles from '../styles.module.scss';
import * as api from '../../lib/api';
import { Pool } from '../../lib/types';

import Modal from '@mui/material/Modal';
import { FormEvent, useState } from 'react';
import { getAccount } from '../../lib/swr';

const minAmount = 0.001;

// TODO: Display cost of purchase (assetPrice * amount)
export default function PoolAssetBuyModal(props: {pool: Pool, onClose: Function, onSubmit: Function}) {

  const [amount, setAmount] = useState<number>(minAmount);
  const { account, updateAccount } = getAccount();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.buyPoolAssets(props.pool.poolId, amount)
      .then(() => {
        updateAccount();
        props.onSubmit();
        props.onClose();
      })
      .catch((error) => console.log(error)); // TODO: Error handling
  };

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className={styles.modal}>
      <h2 className={styles.modalHeader}>Buy Assets</h2>
      <form
        className='pool-asset-buy-form'
        onSubmit={handleSubmit}
      >
        <label className='pool-asset-buy-amount'>
          Amount
          <input
            type='number'
            min={minAmount} // TODO: May need to adjust for different types of assets
            step={minAmount}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <small>{`${Math.trunc(Number(account!.paper) * 100) / 100} 💵`}</small>
        </label>
        <input
          type='submit'
          disabled={amount < minAmount}
          value='Buy'
        />
      </form>
    </div>
    </Modal>
  );

};
