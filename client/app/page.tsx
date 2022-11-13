import Link from 'next/link';
import React from 'react';

export default function Home() {

  return (
    <div className='home-page'>
      <h1>Lightning Protocol</h1>
      <div className='column'>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>
    </div>
  );

}
