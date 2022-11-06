import * as api from '../../lib/api';
import { Asset, ContractType } from '../../lib/types';

import { FormEvent, useState } from 'react';
import Modal from '@mui/material/Modal';

export default function PlaceBidModal(props: {contractType: ContractType, asset: Asset, defaultBid: number | null, onClose: Function}) {

  const [price, setPrice] = useState<number>(props.defaultBid || 0); // TODO: Default to current ask price(?)
  const [amount, setAmount] = useState<number>(1);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    for (let i = 0; i < amount; i++) { // TODO: Create a route which allows submitting multiple bids
      api.createBid(props.contractType.contractTypeId, price)
        .then(() => props.onClose())
        .catch((error) => console.log(error));
    }
  };

  if (!props.contractType.contractTypeId) {
    return null; // TODO: Change this to render some info
  }

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className='place-bid-modal'>
      <h2 className='place-bid-modal-header'>Place Bid</h2>
      <form
        className='place-bid-form'
        onSubmit={handleSubmit}
      >
        <label className='place-bid-price'>
          Price
          <input
            type='number'
            max={1000}
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
        <small>{`Total: $${(props.asset.assetAmount * price * amount).toFixed(2)} ($${props.asset.assetAmount * price} x ${amount})`}</small>
        </label>
        <input
          type='submit'
          disabled={price < 0.01 || amount < 1}
          value='Submit'
        />
      </form>
      {/* <button
        onClick={(e) => props.onClose()}
      >Close</button> */}
    </div>
    </Modal>
  );

};
