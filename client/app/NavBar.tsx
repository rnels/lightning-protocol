'use client';

import styles from './nav.module.scss';

import { useContext, useEffect, useState } from 'react';
import { AccountContext } from './AccountContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {

  const { account }: any = useContext(AccountContext);
  const [activeLink, setActiveLink] = useState<string>();
  const path = usePathname();

  useEffect(() => {
    if (activeLink) return;
    let activePath = path?.split('/')[1];
    setActiveLink(activePath);
  }, []);

  function handleClick(e: any) {
    setActiveLink(e.target.getAttribute('href').split('/')[1]);
  }

  // TODO: Clean up active link implementation
  // TODO: Have this update when links are clicked in other components

  return (
    <div className={styles.navBar}>
      {account ?
      <>
      <div className={styles.navBarLeft}>
        <Link href="/assets" id={activeLink === 'assets' ? styles.currentPage : undefined} onClick={handleClick}>Assets</Link>
        <Link href="/pools" id={activeLink === 'pools' ? styles.currentPage : undefined} onClick={handleClick}>Pools</Link>
        <Link href="/contracts" id={activeLink === 'contracts' ? styles.currentPage : undefined} onClick={handleClick}>Contracts</Link>
        <Link href="/bids" id={activeLink === 'bids' ? styles.currentPage : undefined} onClick={handleClick}>Bids</Link>
        <Link href="/trades" id={activeLink === 'trades' ? styles.currentPage : undefined} onClick={handleClick}>Trades</Link>
        <Link href="/profile" id={activeLink === 'profile' ? styles.currentPage : undefined} onClick={handleClick}>Profile</Link>
      </div>
      {`${Math.trunc(account.paper * 100) / 100} 💵`}
      </>
      :
      <>
        <Link href="/login" id={activeLink === 'login' ? styles.currentPage : undefined} onClick={handleClick}>Login</Link>
        <Link href="/register" id={activeLink === 'register' ? styles.currentPage : undefined} onClick={handleClick}>Register</Link>
      </>
      }
    </div>
  );

}
