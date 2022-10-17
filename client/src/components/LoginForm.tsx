import { FormEvent, useState } from 'react';
import axios from 'axios';
import { serverURL } from '../config';

axios.defaults.withCredentials = true;

export default function LoginForm(props: any) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    axios.post(`${serverURL}/login`, {email, password})
      .then((result) => {
        console.log(result);
      })
      .catch((error) => console.log(error));
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
