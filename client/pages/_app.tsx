import '../styles.css'
import * as api from '../lib/api';
import NavBar from '../components/NavBar';

import React, { useEffect, useState } from 'react';

// This default export is required in a new `pages/_app.js` file.
export default function App({ Component, pageProps }){

  const [logged, setLogged] = useState(false);
  const [paper, setPaper] = useState(0);

  // TODO: Pass down this callback to register and login
  function getAccountInfo(): void {
    api.getAccount()
      .then((account) => {
        setLogged(true);
        setPaper(account.paper);
      })
      .catch((errorRes) => {
        console.log(errorRes);
      });
  }

  useEffect(() => {
    getAccountInfo();
  });

  return (
  <div className='App'>
    <NavBar
      logged={logged}
      paper={paper}
    />
    <Component {...pageProps} />
  </div>
  );

}
