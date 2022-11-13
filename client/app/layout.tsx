'use client';

import '../styles.css'
import * as api from '../lib/api';
import NavBar from '../components/NavBar';

import React, { useEffect, useState } from 'react';
import { AccountContext } from '../components/AccountContext';
import { Account } from '../lib/types';

export default function RootLayout({ children }: { children: React.ReactNode} ) {

  const [account, setAccount] = useState<Account>();

  function getAccountInfo(): void {
    api.getAccount()
      .then((account) => setAccount(account))
      .catch((errorRes) => {
        console.log(errorRes);
      });
  }

  useEffect(() => {
    getAccountInfo();
  }, []);

  return (
    <html lang='en'>
      <body>
      <AccountContext.Provider value={{account, getAccountInfo}}>
        <NavBar/>
        {children}
      </AccountContext.Provider>
      </body>
    </html>
  )
}
