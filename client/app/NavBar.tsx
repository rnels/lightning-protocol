'use client';

import styles from './nav.module.css';

import { useContext } from "react";
import { AccountContext } from "./AccountContext";

import Link from 'next/link';

export default function NavBar() {

  const { account }: any = useContext(AccountContext);

  return (
    <div className={styles['nav-bar']}>
      {account ?
      <>
      <div className={styles['nav-bar-left']}>
        <Link href="/assets">Assets</Link>
        <Link href="/pools">Pools</Link>
        <Link href="/bids">Bids</Link>
        <Link href="/contracts">Contracts</Link>
        <Link href="/trades">Trades</Link>
        <Link href="/profile">Profile</Link>
      </div>
      {`${Math.trunc(account.paper * 100) / 100} 💵`}
      </>
      :
      <>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </>
      }
    </div>
  );

}
