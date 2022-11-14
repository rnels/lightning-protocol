'use client';

import { AccountContext } from '../AccountContext';
import * as api from '../../lib/api';
import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import PaperDepositModal from './PaperDepositModal';

export default function UserProfilePage() {

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
