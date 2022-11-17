'use client';

import { errorMessage as errorMessageStyle } from '../styles.module.css';
import * as api from '../../lib/api';
import React, { FormEvent, useContext, useState } from 'react';
import { AccountContext } from '../AccountContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginForm() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { getAccountInfo }: any = useContext(AccountContext);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.loginAccount(email, password)
      .then(() => {
        getAccountInfo()
        router.push('/profile');
      })
      .catch((errorRes) => {
        console.log(errorRes);
        if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
          setError(errorRes.response.data.message);
        } else {
          setError(errorRes.message);
        }
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>
        Login
      </h2>
      <label>
        Email
        <input
          type='email'
          name='email-input'
          autoComplete='username'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type='password'
          name='password-input'
          autoComplete='current-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <input
        type='submit'
        value='Submit'
      />
      {error && <div className={errorMessageStyle}>{`Error: ${error}`}</div>}
      <Link href="/register">Don't have an account?</Link>
    </form>
  );

};