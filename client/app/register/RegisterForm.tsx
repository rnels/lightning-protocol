'use client';

// import { errorMessage as errorMessageStyle } from '../styles.module.scss';
import styles from '../styles.module.scss';
import * as api from '../../lib/api';

import React, { FormEvent, useState } from 'react';
import { getAccount } from '../../lib/swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {

  const { updateAccount } = getAccount();

  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.registerAccount(email, password, firstName, lastName)
      .then(() => {
        updateAccount()
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
        Register
      </h2>
      <label>
        First name
        <input
          type='text'
          name='first-name-input'
          autoComplete='given-name'
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </label>
      <label>
        Last name
        <input
          type='text'
          name='last-name-input'
          autoComplete='family-name'
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </label>
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
          autoComplete='new-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <input
        type='submit'
        value='Submit'
      />
      {error && <div className={styles.errorMessage}>{`Error: ${error}`}</div>}
      <Link href="/login">Already have an account?</Link>
    </form>
  );

}
