'use client';

import * as api from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PaperDepositModal from './PaperDepositModal';
import { getAccount } from '../../lib/swr';

export default function ProfileInfo() {

  const { account, updateAccount } = getAccount();
  const [showPaperModal, setShowPaperModal] = useState<boolean>(false);

  const router = useRouter();

  if (!account) {
    // router.push('/');
    return null;
  }

  const handleLogout = () => {
    api.logoutAccount()
      .then(() => {
        updateAccount();
        router.push('/');
        router.refresh();
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
