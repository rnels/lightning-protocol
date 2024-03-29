'use client';

// import {
//   modal as modalStyle,
//   modalHeader as modalHeaderStyle,
//   errorMessage as errorMessageStyle
// } from '../../styles.module.scss';
import styles from '../../../styles.module.scss';
import * as api from '../../../../lib/api_user';
import { Asset, ContractType } from '../../../../lib/types';

import { FormEvent, useState } from 'react';
import Modal from '@mui/material/Modal';
import { getAccount } from '../../../../lib/swr';

export default function PlaceBidModal(props: {
  contractType: ContractType,
  asset: Asset,
  defaultBid: number | null,
  onClose: Function
}) {

  const [price, setPrice] = useState<number>(props.defaultBid || 0);
  const [amount, setAmount] = useState<number>(1);
  const [error, setError] = useState('');

  const { account, updateAccount } = getAccount();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await api.createBids(props.contractType.contractTypeId, price, amount)
      .catch((errorRes) => {
        console.log(errorRes);
        if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
          setError(errorRes.response.data.message);
        } else {
          setError(errorRes.message);
        }
      });
    updateAccount(); // TODO: For some reason, this is required for onClose to work properly
    // It's possible that this is due to forcing a re-render on account state changing
    props.onClose();
  };

  // if (!props.contractType.contractTypeId) {
  //   return null; // TODO: Change this to render some info
  // }

  return (
    <Modal
      open={true}
      onClose={() => {
        props.onClose();
        // TODO: Find out why clicking out of the modal doesn't close it
        // Using ESC key works, but not clicking out. Also doesn't work on button (commented out), only on submit
      }}
    >
    <div className={styles.modal}>
      <h2 className={styles.modalHeader}>Place Bid</h2>
      <form
        className='place-bid-form'
        onSubmit={handleSubmit}
      >
        <label className='place-bid-price'>
          Price
          <input
            type='number'
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(Math.trunc(Number(e.target.value) * 100) / 100)}
          />
        <small>{`Cost: $${(Number(props.asset.assetAmount) * price).toFixed(2)} ($${price} x ${props.asset.assetAmount})`}</small>
        </label>

        <label className='place-bid-amount'>
          Contracts
          <input
            type='number'
            min={1}
            step={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Math.floor(Number(e.target.value))))}
          />
        <small>{`Total: $${(Number(props.asset.assetAmount) * price * amount).toFixed(2)} ($${(Number(props.asset.assetAmount) * price).toFixed(2)} x ${amount})`}</small>
        </label>
        <input
          type='submit'
          disabled={price < 0.01 || amount < 1}
          value='Submit'
        />
        {error && <label className={styles.errorMessage}>{error}</label>}
      </form>
      {/* <button
        onClick={(e) => {
          e.preventDefault();
          props.onClose()
        }}
      >Close</button> */}
    </div>
    </Modal>
  );

}
