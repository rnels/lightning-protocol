// import {
//   homePage as pageStyle,
//   homePageHeader as headerStyle
// } from './home.module.scss';
import styles from './home.module.scss';

import Link from 'next/link';
import React from 'react';

export default function Home() {

  return (
    <div className={styles.homePage}>
      <h1 id={styles.homePageHeader}>⚡ Protocol</h1>
      <div className='column'>
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
      </div>
    </div>
  );

}
