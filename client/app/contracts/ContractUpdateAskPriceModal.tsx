'use client';

import * as api from '../../lib/api';
import { Contract } from '../../lib/types';

import { FormEvent, useState } from 'react';
import Modal from '@mui/material/Modal';

export default function ContractUpdateAskPriceModal(props: {contract: Contract, onClose: Function}) {

  const [price, setPrice] = useState<number>(props.contract.askPrice || 0);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.updateAskPrice(props.contract.contractId, price)
      .then(() => props.onClose())
      .catch((errorRes) => {
        console.log(errorRes);
        if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
          setError(errorRes.response.data.message);
        } else {
          setError(errorRes.message);
        }
      });
  };

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className='update-ask-modal'>
      <h2 className='update-ask-modal-header'>Set Ask</h2>
      <form
        className='update-ask-form'
        onSubmit={handleSubmit}
      >
        <label className='update-ask-price'>
          Price
          <input
            type='number'
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(Math.trunc(Number(e.target.value) * 100) / 100)}
          />
        </label>
        <input
          type='submit'
          disabled={price < 0.01}
          value='Submit'
        />
        <small>Note: Pool provider fee accounts for 1% of sale cost</small>
        {error && <label className='error-message'>{error}</label>}
      </form>
      {/* <button
        onClick={(e) => props.onClose()}
      >Close</button> */}
    </div>
    </Modal>
  );

};
