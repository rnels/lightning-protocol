import * as api from '../../lib/api';
import { Pool } from '../../lib/types';

import { FormEvent, useState } from 'react';
import Modal from '@mui/material/Modal';

const minAmount = 0.001;

export default function PoolAssetWithdrawModal(props: {pool: Pool, onClose: Function}) {

  const [amount, setAmount] = useState<number>(minAmount);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.withdrawPoolAssets(props.pool.poolId, amount)
      .then(() => props.onClose())
      .catch((error) => console.log(error));
  };

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className='pool-asset-withdraw-modal'>
      <h2 className='pool-asset-withdraw-modal-header'>Withdraw Assets</h2>
      <form
        className='pool-asset-withdraw-form'
        onSubmit={handleSubmit}
      >
        <label className='pool-asset-withdraw-amount'>
          Amount
          <input
            type='number'
            min={minAmount} // TODO: May need to adjust for different types of assets
            max={props.pool.assetAmount}
            step={minAmount}
            value={amount}
            onChange={(e) => setAmount(Math.min(props.pool.assetAmount, Number(e.target.value)))}
          />
        <small>{`Asset Amount: ${props.pool.assetAmount}`}</small>
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
