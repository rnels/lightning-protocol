import * as api from '../lib/api';

import React, { FormEvent, useContext, useState } from 'react';
import { AccountContext } from '../components/AccountContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Register() {

  return (
    <div className='register-page'>
      <RegisterForm/>
    </div>
  );

};

function RegisterForm() {

  const { getAccountInfo }: any = useContext(AccountContext);
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
    <form className='register-form' onSubmit={handleSubmit}>
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
      {error && <div className='error-message'>{`Error: ${error}`}</div>}
      <Link href="/login">Already have an account?</Link>
    </form>
  );

};
