'use client';

import './global.scss';
import { app as appStyle } from './styles.module.scss'
import * as api from '../lib/api';
import NavBar from './NavBar';

import React, { useEffect, useState } from 'react';
import { AccountContext } from './AccountContext';
import { Account } from '../lib/types';

export default function RootLayout({ children }: { children: React.ReactNode } ) {

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
      <div className={appStyle}>
        <AccountContext.Provider value={{account, getAccountInfo}}>
          <NavBar/>
          {children}
        </AccountContext.Provider>
        </div>
      </body>
    </html>
  )
}
