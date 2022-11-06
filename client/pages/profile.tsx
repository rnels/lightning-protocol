import * as api from '../lib/api';
import { Account } from '../lib/types';

import React from 'react';
import { GetServerSideProps } from 'next';

export default function UserProfile(props: {account: Account}) {

  return (
    <div className='user-profile-page'>
      <h2>Profile</h2>
      <p>{`Email: ${props.account.email}`}</p>
      <p>{`Name: ${props.account.firstName} ${props.account.lastName}`}</p>
      <p>{`Paper: ${Math.trunc(props.account.paper * 100) / 100}`}</p>
    </div>

  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {

  let account = await api.getAccount();

  return {
    props: {
      account
    }
  }

};
