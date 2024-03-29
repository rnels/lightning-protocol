'use client';

import styles from './nav.module.scss';

import { getAccount } from '../lib/swr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {

  const { account } = getAccount();

  const path = usePathname();
  let splitPath = path!.split('/');
  const activeLink = splitPath[1];

  return (
    <div className={styles.navBar}>
      {account ?
      <>
      <div className={styles.navBarLeft}>
        <Link href="/" id={activeLink === '' ? styles.currentPage : undefined}>Home</Link>
        <Link href="/discover" id={activeLink === 'discover' ? styles.currentPage : undefined}>Discover</Link>
        <Link href="/assets" id={activeLink === 'assets' ? styles.currentPage : undefined}>Assets</Link>
        <Link href="/pools" id={activeLink === 'pools' ? styles.currentPage : undefined}>Pools</Link>
        <Link href="/contracts" id={activeLink === 'contracts' ? styles.currentPage : undefined}>Contracts</Link>
        <Link href="/bids" id={activeLink === 'bids' ? styles.currentPage : undefined}>Bids</Link>
        <Link href="/trades" id={activeLink === 'trades' ? styles.currentPage : undefined}>Trades</Link>
        <Link href="/profile" id={activeLink === 'profile' ? styles.currentPage : undefined}>Profile</Link>
      </div>
      {`${Math.trunc(Number(account.paper) * 100) / 100} 💵`}
      </>
      :
      <div>
        <Link href="/login" id={activeLink === 'login' ? styles.currentPage : undefined}>Login</Link>
        <Link href="/register" id={activeLink === 'register' ? styles.currentPage : undefined}>Register</Link>
      </div>
      }
    </div>
  );

}
