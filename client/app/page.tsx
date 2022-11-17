import {
  homePage as pageStyle,
  homePageHeader as headerStyle
} from './home.module.css';

import Link from 'next/link';
import React from 'react';

export default function Home() {

  return (
    <div className={pageStyle}>
      <h1 id={headerStyle}>⚡ Protocol</h1>
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
