import { Account } from '../lib/types';
import { AccountContext } from '../components/AccountContext';
import React, { useContext } from 'react';


export default function UserProfile() {

  const { account }: any = useContext(AccountContext);

  console.log(account);

  if (!account) return null;

  return (
    <div className='user-profile-page'>
      <h2>Profile</h2>
      <p>{`Email: ${account.email}`}</p>
      <p>{`Name: ${account.firstName} ${account.lastName}`}</p>
      <p>{`Paper: ${Math.trunc(account.paper * 100) / 100}`}</p>
    </div>
  );

};
