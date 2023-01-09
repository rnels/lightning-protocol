'use client';

// import {
//   modal as modalStyle,
//   modalHeader as modalHeaderStyle,
//   errorMessage as errorMessageStyle
// } from '../styles.module.scss';
import styles from '../../styles.module.scss';
import * as api from '../../../lib/api_client';
import { Contract } from '../../../lib/types';

import { FormEvent, useState } from 'react';
import Modal from '@mui/material/Modal';

export default function ContractUpdateAskPriceModal(props: {contract: Contract, onClose: Function, onSubmit: Function}) {

  const [price, setPrice] = useState<string | number>(props.contract.askPrice || 0);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.updateAskPrice(props.contract.contractId, Number(price))
      .then(() => {
        props.onSubmit();
        props.onClose();
      })
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
    <div className={styles.modal}>
      <h2 className={styles.modalHeader}>Set Ask</h2>
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
        {error && <label className={styles.errorMessage}>{error}</label>}
      </form>
      {/* <button
        onClick={(e) => props.onClose()}
      >Close</button> */}
    </div>
    </Modal>
  );

};
