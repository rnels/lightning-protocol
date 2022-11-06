import * as api from '../../lib/api';
import { Bid, Contract } from '../../lib/types';

import { FormEvent, useState } from 'react';
import Modal from '@mui/material/Modal';

export default function UpdateBidPriceModal(props: {bid: Bid, onClose: Function}) {

  const [price, setPrice] = useState<number>(props.bid.bidPrice || 0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.updateBidPrice(props.bid.bidId, price)
      .then(() => props.onClose())
      .catch((error) => console.log(error));
  };

    return (
      <Modal
        open={true}
        onClose={(e) => props.onClose()}
      >
      <div className='update-bid-modal'>
        <h2 className='update-bid-modal-header'>Update bid</h2>
        <form
          className='update-bid-form'
          onSubmit={handleSubmit}
        >
          <label className='update-bid-price'>
            Price
            <input
              type='number'
              max={1000}
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
        </form>
        {/* <button
          onClick={(e) => props.onClose()}
        >Close</button> */}
      </div>
      </Modal>
    );
};
