import * as api from '../lib/api';

import React, { FormEvent, useState } from "react";

export default function Login() {

  return (
    <div className='login-page'>
      <LoginForm // TODO: Update with actual getInfo callback after implementing state management system
        submitCallback={() => {}}
      />
    </div>
  );

};

function LoginForm(props: {submitCallback: Function}) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // TODO: Hook this up to a global state manager to update logged status instead of using submitCallback
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    api.loginAccount(email, password)
      .then(() => props.submitCallback())
      .catch((errorRes) => {
        console.log(errorRes);
        if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
          setError(errorRes.response.data.message);
        } else {
          setError(errorRes.message);
        }
      });
  }

  return (
    <form className='login-form' onSubmit={handleSubmit}>
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
      {error && <div className='error-message'>{`Error: ${error}`}</div>}
      <a href='/register'>Don't have an account?</a>
    </form>
  );
};
