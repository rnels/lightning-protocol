import * as api from '../lib/api';
import { Account } from '../lib/types';

import { useEffect, useState } from 'react';
import React from 'react';

export default function UserProfile(props: any) {

  const [account, setAccount] = useState<Account>();

  useEffect(() => {
    api.getAccount()
      .then((account) => setAccount(account))
      .catch((err) => console.log(err));
  }, []);

  if (!account) return null;

  return (
    <div className="user-profile">
      <h2>Profile</h2>
      <p>{`Email: ${account.email}`}</p>
      <p>{`Name: ${account.firstName} ${account.lastName}`}</p>
      <p>{`Paper: ${Math.trunc(account.paper * 100) / 100}`}</p>
    </div>

  );
};
