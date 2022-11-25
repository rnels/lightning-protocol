'use client';

import {
  modal as modalStyle,
  modalHeader as modalHeaderStyle
} from '../styles.module.scss';
import * as api from '../../lib/api';
import { Pool } from '../../lib/types';

import { FormEvent, useState } from 'react';
import Modal from '@mui/material/Modal';

const minAmount = 0.001;

export default function PoolAssetWithdrawModal(props: {pool: Pool, unlockedAmount: number, onClose: Function}) {

  const [amount, setAmount] = useState<number>(props.unlockedAmount);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.withdrawPoolAssets(props.pool.poolId, amount)
      .then(() => props.onClose())
      .catch((error) => console.log(error)); // TODO: Error handling
  };

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className={modalStyle}>
      <h2 className={modalHeaderStyle}>Withdraw Assets</h2>
      <form
        className='pool-asset-withdraw-form'
        onSubmit={handleSubmit}
      >
        <label className='pool-asset-withdraw-amount'>
          Amount
          <input
            type='number'
            min={minAmount} // TODO: May need to adjust for different types of assets
            max={props.unlockedAmount}
            step={minAmount}
            value={amount}
            onChange={(e) => setAmount(Math.min(props.unlockedAmount, Number(e.target.value)))}
          />
        <small>{`Unlocked Asset Amount: ${props.unlockedAmount}`}</small>
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
