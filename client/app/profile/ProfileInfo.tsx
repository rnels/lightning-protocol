'use client';

import { AccountContext } from '../AccountContext';
import * as api from '../../lib/api';
import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PaperDepositModal from './PaperDepositModal';

export default function ProfileInfo() {

  const { account, getAccountInfo }: any = useContext(AccountContext);
  const [showPaperModal, setShowPaperModal] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (!account) router.push('/');
  }, []);

  const handleLogout = () => {
    api.logoutAccount()
      .then(() => {
        getAccountInfo();
        router.push('/');
        router.refresh();
      })
      .catch((error) => console.log(error));
  };

  if (!account) return null;

  return (
    <div className='profile-info'>
      <p>{`Email: ${account.email}`}</p>
      <p>{`Name: ${account.firstName} ${account.lastName}`}</p>
      <p>{`${Math.trunc(account.paper * 100) / 100} 💵`}</p>
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
          getAccountInfo();
        }}
      />}
    </div>
  );

};
