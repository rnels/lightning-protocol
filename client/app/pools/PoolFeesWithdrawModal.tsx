'use client';

import {modal as modalStyle, modalHeader as modalHeaderStyle} from '../styles.module.css';
import * as api from '../../lib/api';
import { Pool } from '../../lib/types';

import { FormEvent, useContext, useState } from 'react';
import Modal from '@mui/material/Modal';
import { AccountContext } from '../AccountContext';

const minAmount = 0.01;

export default function PoolFeesWithdrawModal(props: {pool: Pool, onClose: Function}) {

  const [amount, setAmount] = useState<number>(Math.trunc(props.pool.tradeFees * 100) / 100);

  const { getAccountInfo }: any = useContext(AccountContext);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.withdrawPoolFees(props.pool.poolId, amount)
      .then(() => {
        getAccountInfo();
        props.onClose();
      })
      .catch((error) => console.log(error));
  };

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className={modalStyle}>
      <h2 className={modalHeaderStyle}>Withdraw Fees</h2>
      <form
        className='pool-fees-withdraw-form'
        onSubmit={handleSubmit}
      >
        <label className='pool-fees-withdraw-amount'>
          Amount
          <input
            type='number'
            min={minAmount}
            max={props.pool.tradeFees}
            step={minAmount}
            value={amount}
            onChange={(e) => setAmount(Math.min(props.pool.tradeFees, Number(e.target.value)))}
          />
        <small>{`Fee Amount: ${Math.trunc(Number(props.pool.tradeFees) * 100) / 100}`}</small>
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
