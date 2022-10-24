import { FormEvent, useState } from 'react';
import axios from '../../lib/axios';
import { serverURL } from '../../config';
import { Link } from "react-router-dom";

export default function LoginForm(props: {submitCallback: Function}) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios.post(`${serverURL}/login`, {email, password})
      .then(() => {
        props.submitCallback();
      })
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
      <form className="login-form" onSubmit={handleSubmit}>
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
      <Link to='/register'>
        <small>Don't have an account?</small>
      </Link>
      </form>

    );
};
