'use client';

import * as api from '../../lib/api';
import Modal from '@mui/material/Modal';
import React, { useState, FormEvent } from 'react';

const minAmount = 0.01;

export default function PaperDepositModal(props: { onClose: Function }) {

  const [amount, setAmount] = useState<number>(minAmount);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.depositPaper(amount)
      .then(() => props.onClose())
      .catch((error) => console.log(error));
  };

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className='paper-deposit-modal'>
      <h2 className='paper-deposit-modal-header'>Deposit Paper</h2>
      <form
        className='paper-deposit-form'
        onSubmit={handleSubmit}
      >
        <label className='paper-deposit-amount'>
          Amount
          <input
            type='number'
            min={minAmount}
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
