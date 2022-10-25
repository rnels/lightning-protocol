import { FormEvent, useState } from 'react';
import axios from '../../lib/axios';
import { serverURL } from '../../config';

import { useParams } from 'react-router-dom';

export default function PlaceBidView() {

  const [price, setPrice] = useState<number>(0); // TODO: Default to current ask price(?)
  const [amount, setAmount] = useState<number>(1);

  const { typeId } = useParams();

  const submitBid = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    for (let i = 0; i < amount; i++) { // TODO: Create a route which allows submitting multiple bids
      axios.post(`${serverURL}/bid`, {
        typeId,
        bidPrice: price
      })
        .then(() => console.log('success'))
        .catch((error) => console.log(error));
    }
  };

  if (!typeId) {
    return null; // TODO: Change this to render some info
  }

    return (
      <div className="place-bid-view">
        <h2 className='place-bid-view-header'>Place Bid</h2>
        <form
          className='place-bid-form'
          onSubmit={submitBid}
        >
          <label className='place-bid-price'>
            Price
            <input
              type='number'
              min={0}
              step={0.01}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              value={price}
            />
          </label>
          <label className='place-bid-amount'>
            Contract Amount
            <input
              type='number'
              min={1}
              step={1}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              value={amount}
            />
          </label>
          <input
            type='submit'
            value='Submit'
          />
        </form>
      </div>

    );
};
