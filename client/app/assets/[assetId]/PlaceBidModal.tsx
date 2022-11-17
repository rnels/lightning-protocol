'use client';

import {
  modal as modalStyle,
  modalHeader as modalHeaderStyle,
  errorMessage as errorMessageStyle
} from '../../styles.module.css';
import * as api from '../../../lib/api';
import { Asset, ContractType } from '../../../lib/types';

import { FormEvent, useState, useContext } from 'react';
import Modal from '@mui/material/Modal';
import { AccountContext } from '../../AccountContext';

export default function PlaceBidModal(props: {
  contractType: ContractType,
  asset: Asset,
  defaultBid: number | null,
  onClose: Function
}) {

  const [price, setPrice] = useState<number>(props.defaultBid || 0); // TODO: Default to current ask price(?)
  const [amount, setAmount] = useState<number>(1);
  const [error, setError] = useState('');

  const { getAccountInfo }: any = useContext(AccountContext);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let createBidPromises = [];
    for (let i = 0; i < amount; i++) { // TODO: Create a route which allows submitting multiple bids
      createBidPromises.push(
        api.createBid(props.contractType.contractTypeId, price)
        .catch((errorRes) => {
          console.log(errorRes);
          if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
            setError(errorRes.response.data.message);
          } else {
            setError(errorRes.message);
          }
        })
      );
    }
    await Promise.all(createBidPromises);
    getAccountInfo();
    props.onClose();
  };

  if (!props.contractType.contractTypeId) {
    return null; // TODO: Change this to render some info
  }

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className={modalStyle}>
      <h2 className={modalHeaderStyle}>Place Bid</h2>
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
        <small>{`Cost: $${(props.asset.assetAmount * price).toFixed(2)} ($${price} x ${props.asset.assetAmount})`}</small>
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
        <small>{`Total: $${(props.asset.assetAmount * price * amount).toFixed(2)} ($${(props.asset.assetAmount * price).toFixed(2)} x ${amount})`}</small>
        </label>
        <input
          type='submit'
          disabled={price < 0.01 || amount < 1}
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

}
