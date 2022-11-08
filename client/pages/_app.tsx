import '../styles.css'
import * as api from '../lib/api';
import NavBar from '../components/NavBar';

import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app'
import Head from 'next/head';
import { AccountContext } from '../components/AccountContext';
import { Account } from '../lib/types';

export default function App({ Component, pageProps }: AppProps){

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
    <div className='App'>
      <Head>
        <title>Lightning Protocol</title>
      </Head>
      <AccountContext.Provider value={{account, setAccount}}>
        <NavBar/>
        <Component {...pageProps} />
      </AccountContext.Provider>
    </div>
  );

}
