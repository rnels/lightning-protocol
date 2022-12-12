'use client';

// import {
//   homePage as pageStyle,
//   homePageHeader as headerStyle
// } from './home.module.scss';
import styles from './home.module.scss';
import { getAccount } from '../lib/swr';

import Link from 'next/link';
import React from 'react';

export default function Home() {

  const { account } = getAccount();

  return (
    <div className={styles.homePage}>
      <h1 id={styles.homePageHeader}>⚡ Protocol</h1>
      <div className='column'>
        {account ?
        <>
        <Link href="/discover">
          <button>
            Discover
          </button>
        </Link>
        <Link href="/pools">
          <button>
            Pools
          </button>
        </Link>
        </>
        :
        <>
        <Link href="/login">
          <button>
            Login
          </button>
        </Link>
        <Link href="/register">
          <button>
            Register
          </button>
        </Link>
        </>
        }
      </div>
    </div>
  );

}
