'use client';

import { redirect } from 'next/navigation';

import React from 'react';
import { getAccount } from '../../lib/swr';

/** Authenticates whether the user is currently signed in. If not, redirect to login page */
export default function AuthLayout({ children }: { children: React.ReactNode } ) {

  const { account } = getAccount();
  if (!account) redirect('/login'); // If user is not signed in, redirect to login page

  return (
    <>
      {children}
    </>
  );

}
