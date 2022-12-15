'use client';

// import {
//   modal as modalStyle,
//   modalHeader as modalHeaderStyle
// } from '../styles.module.scss';
import styles from '../../styles.module.scss';
import * as api from '../../../lib/api';
import { Pool } from '../../../lib/types';

import { FormEvent, useState } from 'react';
import Modal from '@mui/material/Modal';
import { getAccount } from '../../../lib/swr';

const minAmount = 0.001;

export default function PoolAssetSellModal(props: {pool: Pool, unlockedAmount: number, onClose: Function, onSubmit: Function}) {

  const [amount, setAmount] = useState<number>(props.unlockedAmount);
  const { account, updateAccount } = getAccount();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.sellPoolAssets(props.pool.poolId, amount)
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
      <h2 className={styles.modalHeader}>Sell Assets</h2>
      <form
        className='pool-asset-sell-form'
        onSubmit={handleSubmit}
      >
        <label className='pool-asset-sell-amount'>
          Amount
          <input
            type='number'
            min={minAmount} // TODO: May need to adjust for different types of assets
            max={props.unlockedAmount}
            step={minAmount}
            value={amount}
            onChange={(e) => setAmount(Math.min(props.unlockedAmount, Number(e.target.value)))}
          />
          <small>{`Unlocked Assets: ${props.unlockedAmount}`}</small>
        </label>
        <input
          type='submit'
          disabled={amount < minAmount}
          value='Sell'
        />
      </form>
    </div>
    </Modal>
  );

};
