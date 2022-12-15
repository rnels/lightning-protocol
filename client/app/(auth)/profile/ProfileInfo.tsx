'use client';

import * as api from '../../../lib/api';
import React, { useState } from 'react';
import { redirect } from 'next/navigation';
import PaperDepositModal from './PaperDepositModal';
import { getAccount } from '../../../lib/swr';


export default function ProfileInfo() {

  const { account, updateAccount } = getAccount();
  if (!account) {
    return null;
  }
  const [showPaperModal, setShowPaperModal] = useState<boolean>(false);

  const handleLogout = () => {
    api.logoutAccount()
      .then(() => {
        updateAccount(); // Should automatically redirect to '/login' due to (auth) layout.tsx
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className='profile-info'>
      <p>{`Email: ${account.email}`}</p>
      <p>{`Name: ${account.firstName} ${account.lastName}`}</p>
      <p>{`${Math.trunc(Number(account.paper) * 100) / 100} 💵`}</p>
      <button onClick={() => setShowPaperModal(true)}>
        Deposit
      </button>
      <button onClick={handleLogout}>
        Logout
      </button>
      {showPaperModal &&
      <PaperDepositModal
        onClose={() => {
          setShowPaperModal(false);
        }}
      />}
    </div>
  );

};
