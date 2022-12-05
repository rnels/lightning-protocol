'use client'; // NOTE: Error boundaries must be client components

import './global.scss';
import styles from './home.module.scss';
import React from 'react';
import Link from 'next/link';

export default function ErrorPage() {

  return (
    <div className={styles.homePage}>
      <h2 style={{marginBottom: '0px'}}>Error!</h2>
      <p>It's possible you're not logged in.</p>
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
