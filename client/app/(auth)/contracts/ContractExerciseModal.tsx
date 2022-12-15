'use client';

// import {
//   modal as modalStyle,
//   modalHeader as modalHeaderStyle,
//   errorMessage as errorMessageStyle
// } from '../styles.module.scss';
import styles from '../../styles.module.scss';
import * as api from '../../../lib/api';
import { Contract } from '../../../lib/types';

import { FormEvent, useState } from 'react';
import Modal from '@mui/material/Modal';

export default function ContractExerciseModal(props: {contract: Contract, onClose: Function, onSubmit: Function}) {

  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.exerciseContract(props.contract.contractId)
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
      <h2 className={styles.modalHeader}>Exercise</h2>
      <form
        className='exercise-contract-form'
        onSubmit={handleSubmit}
      >
        <label className='exercise-contract-confirm'>
          Are you sure?
          <input
            type='submit'
            value='Confirm'
          />
        </label>
        {error && <label className={styles.errorMessage}>{error}</label>}
      </form>
      {/* <button
        onClick={(e) => props.onClose()}
      >Close</button> */}
    </div>
    </Modal>
  );

};
