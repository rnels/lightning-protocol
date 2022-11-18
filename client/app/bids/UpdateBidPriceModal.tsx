'use client';

import {
  modal as modalStyle,
  modalHeader as modalHeaderStyle,
  errorMessage as errorMessageStyle
} from '../styles.module.css';
import * as api from '../../lib/api';
import { Bid } from '../../lib/types';

import { FormEvent, useContext, useState } from 'react';
import Modal from '@mui/material/Modal';
import { AccountContext } from '../AccountContext';

export default function UpdateBidPriceModal(props: {bid: Bid, onClose: Function}) {

  const [price, setPrice] = useState<string | number>(props.bid.bidPrice || 0);
  const [error, setError] = useState('');

  const { getAccountInfo }: any = useContext(AccountContext);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.updateBidPrice(props.bid.bidId, Number(price))
      .then(() => {
        getAccountInfo();
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
    <div className={modalStyle}>
      <h2 className={modalHeaderStyle}>Update bid</h2>
      <form
        className='update-bid-form'
        onSubmit={handleSubmit}
      >
        <label className='update-bid-price'>
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
        {error && <label className={errorMessageStyle}>{error}</label>}
      </form>
      {/* <button
        onClick={(e) => props.onClose()}
      >Close</button> */}
    </div>
    </Modal>
  );

};
