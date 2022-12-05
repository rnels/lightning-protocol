'use client';

import './global.scss';
import styles from './styles.module.scss'
import NavBar from './NavBar';

import React from 'react';
import { AccountContext } from './AccountContext';
import { Account } from '../lib/types';
import useSWR from 'swr';
import { getAccount } from '../lib/swr';

const { url, fetcher } = getAccount();

export default function RootLayout({ children }: { children: React.ReactNode } ) {

  const { data, error, mutate } = useSWR(url, fetcher);
  const getAccountInfo = mutate.bind(mutate, data);
  let account: Account | null;
  if (error || !data) account = null;
  else account = data;

  return (
    <html lang='en'>
      <body>
      <div className={styles.app}>
        <AccountContext.Provider value={{account, getAccountInfo}}>
          <NavBar/>
          {children}
        </AccountContext.Provider>
        </div>
      </body>
    </html>
  );

}
