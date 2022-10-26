import { FormEvent, useState } from 'react';
import axios from '../../lib/axios';
import { serverURL } from '../../config';

import { useParams } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import { ContractType } from '../../lib/types';

export default function PlaceBidModal(props: {contractType: ContractType, defaultBid: number | null, onClose: Function}) {

  const [price, setPrice] = useState<number>(props.defaultBid || 0); // TODO: Default to current ask price(?)
  const [amount, setAmount] = useState<number>(1);

  const submitBid = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    for (let i = 0; i < amount; i++) { // TODO: Create a route which allows submitting multiple bids
      axios.post(`${serverURL}/bid`, {
        typeId: props.contractType.contractTypeId,
        bidPrice: price
      })
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
          onSubmit={submitBid}
        >
          <label className='place-bid-price'>
            Price
            <input // TODO: There are some problems with entering a value here due to the onChange handler, Ex: 0.29 acts weird. Figure that out
              type='number'
              max={1000}
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(Math.min(Math.max(0, Math.trunc(Number(e.target.value) * 100) / 100), 1000))}
            />
          <small>{`Cost: $${(props.contractType.assetAmount * price).toFixed(2)} ($${price} x ${props.contractType.assetAmount})`}</small>
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
          <small>{`Total: $${(props.contractType.assetAmount * price * amount).toFixed(2)} ($${props.contractType.assetAmount * price} x ${amount})`}</small>
          </label>
          <input
            type='submit'
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
