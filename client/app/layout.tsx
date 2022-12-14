import './global.scss';
import styles from './styles.module.scss'
import NavBar from './NavBar';

import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode } ) {

  return (
    <html lang='en'>
      <body>
        <div className={styles.app}>
          <NavBar/>
          {children}
        </div>
      </body>
    </html>
  );

}
