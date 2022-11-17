'use client';

import {
  modal as modalStyle,
  modalHeader as modalHeaderStyle
} from '../styles.module.css';
import * as api from '../../lib/api';
import { Pool } from '../../lib/types';

import Modal from '@mui/material/Modal';
import { FormEvent, useState } from 'react';

const minAmount = 0.001;

export default function PoolAssetDepositModal(props: {pool: Pool, onClose: Function}) {

  const [amount, setAmount] = useState<number>(minAmount);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.depositPoolAssets(props.pool.poolId, amount)
      .then(() => props.onClose())
      .catch((error) => console.log(error)); // TODO: Error handling
  };

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className={modalStyle}>
      <h2 className={modalHeaderStyle}>Deposit Assets</h2>
      <form
        className='pool-asset-deposit-form'
        onSubmit={handleSubmit}
      >
        <label className='pool-asset-deposit-amount'>
          Amount
          <input
            type='number'
            min={minAmount} // TODO: May need to adjust for different types of assets
            step={minAmount}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
        <input
          type='submit'
          disabled={amount < minAmount}
          value='Submit'
        />
      </form>
    </div>
    </Modal>
  );

};
