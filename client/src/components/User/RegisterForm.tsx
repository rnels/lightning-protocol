import { FormEvent, useState } from 'react';
import axios from '../../lib/axios';
import { serverURL } from '../../config';
import { Link } from "react-router-dom";

export default function RegisterForm(props: {submitCallback: Function}) {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios.post(`${serverURL}/register`, {firstName, lastName, email, password})
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
      <form className="register-form" onSubmit={handleSubmit}>
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
      <Link to='/login'>
        <small>Already have an account?</small>
      </Link>
      </form>
    );
};