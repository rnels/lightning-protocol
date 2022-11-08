import { Account } from '../lib/types';
import { AccountContext } from '../components/AccountContext';
import * as api from '../lib/api';
import Modal from '@mui/material/Modal';
import React, { useContext, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';

const minAmount = 0.01;

export default function UserProfile() {

  const { account, getAccountInfo }: any = useContext(AccountContext);
  const [showPaperModal, setShowPaperModal] = useState<boolean>(false);

  const router = useRouter();

  if (!account) return null;

  const handleLogout = () => {
    api.logoutAccount()
      .then(() => router.push('/'))
      .catch((error) => console.log(error));
  };

  return (
    <div className='user-profile-page'>
      <h2>Profile</h2>
      <p>{`Email: ${account.email}`}</p>
      <p>{`Name: ${account.firstName} ${account.lastName}`}</p>
      <p>{`${Math.trunc(account.paper * 100) / 100} 💵`}</p>
      <button onClick={() => setShowPaperModal(true)}>
        Deposit
      </button>
      <button onClick={handleLogout}>
        Logout
      </button>
      {showPaperModal && <AccountPaperDepositModal
      onClose={() => {
        setShowPaperModal(false);
        getAccountInfo();
      }}
      />}
    </div>
  );

};

function AccountPaperDepositModal(props: { onClose: Function }) {

  const [amount, setAmount] = useState<number>(minAmount);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.depositPaper(amount)
      .then(() => props.onClose())
      .catch((error) => console.log(error));
  };

  return (
    <Modal
      open={true}
      onClose={(e) => props.onClose()}
    >
    <div className='account-paper-deposit-modal'>
      <h2 className='account-paper-deposit-modal-header'>Deposit Paper</h2>
      <form
        className='account-paper-deposit-form'
        onSubmit={handleSubmit}
      >
        <label className='account-paper-deposit-amount'>
          Amount
          <input
            type='number'
            min={minAmount}
            step={minAmount}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
        <input
          type='submit'
          disabled={amount < minAmount}
          value='Submit'
        />
      </form>
    </div>
    </Modal>
  );

};
