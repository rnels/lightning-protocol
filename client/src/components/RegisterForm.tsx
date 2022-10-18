import { FormEvent, useState } from 'react';
import axios from '../lib/axios';
import { serverURL } from '../config';

export default function RegisterForm(props: any) {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    axios.post(`${serverURL}/register`, {firstName, lastName, email, password})
      .then((result) => {
        console.log(result);
      })
      .catch((error) => console.log(error));
  }

    return (
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>
          Register
        </h2>
        <label>
          First Name
          <input
            type='text'
            name='first-name-input'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        <label>
          Last Name
          <input
            type='text'
            name='last-name-input'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type='email'
            name='email-input'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type='password'
            name='password-input'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <input
          type='submit'
          value='Submit'
        />
      </form>
    );
};
