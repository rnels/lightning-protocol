import * as api from '../../lib/api';
import { Pool } from '../../lib/types';

import Modal from '@mui/material/Modal';
import { FormEvent, useState } from 'react';

const minAmount = 0.01;

// TODO: Should visually update account paper balance
export default function PoolFeesWithdrawModal(props: {pool: Pool, onClose: Function}) {

  const [amount, setAmount] = useState<number>(minAmount);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.withdrawPoolFees(props.pool.poolId, amount)
      .then(() => props.onClose())
      .catch((error) => console.log(error));
  };

    return (
      <Modal
        open={true}
        onClose={(e) => props.onClose()}
      >
      <div className='pool-fees-withdraw-modal'>
        <h2 className='pool-fees-withdraw-modal-header'>Withdraw Fees</h2>
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
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          <small>{`Fee Amount: ${props.pool.tradeFees}`}</small>
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
