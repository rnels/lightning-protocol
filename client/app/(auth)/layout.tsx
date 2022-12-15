// NOTE: Need client so I can use getAccount().
// If I wanted to make it a server component, I'd have to use cookies() which would force dynamic rendering
'use client';

import { redirect } from 'next/navigation';

import React from 'react';
import { getAccount } from '../../lib/swr';

/** Authenticates whether the user is currently signed in. If not, redirect to login page */
export default function AuthLayout({ children }: { children: React.ReactNode } ) {

  const { account } = getAccount();
  if (account === null) redirect('/login'); // If user is not signed in, redirect to login page
  else if (account === undefined) return null; // account === null if there's an error, undefined if it's still loading. Doing this means it doesn't redirect if entering into the app via a child route

  return (
    <>
      {children}
    </>
  );

}
