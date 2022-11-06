import * as api from '../../lib/api';
import { Contract } from '../../lib/types';

import { FormEvent, useState } from 'react';
import Modal from '@mui/material/Modal';

export default function ContractUpdateAskPriceModal(props: {contract: Contract, onClose: Function}) {

  const [price, setPrice] = useState<number>(props.contract.askPrice || 0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.updateAskPrice(props.contract.contractId, price)
      .then(() => props.onClose())
      .catch((error) => console.log(error));
  };

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className='update-ask-modal'>
      <h2 className='update-ask-modal-header'>Update Ask</h2>
      <form
        className='update-ask-form'
        onSubmit={handleSubmit}
      >
        <label className='update-ask-price'>
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
