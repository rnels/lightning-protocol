import React from 'react';
import './App.css';
import axios from './lib/axios';
import { serverURL } from './config';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

type Props = {}

type State = {
  accountId: number,
  email: string,
  firstName: string,
  lastName: string,
  paper: number,
  error: string
}

export default class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      accountId: 0,
      email: '',
      firstName: '',
      lastName: '',
      paper: 0,
      error: ''
    };
    this.getAccountInfo = this.getAccountInfo.bind(this);
  }

  getAccountInfo(): void {
    axios.get(`${serverURL}/account`)
      .then((result) => {
        console.log(result);
        this.setState({
        email: result.data.account.email,
        firstName: result.data.account.first_name,
        lastName: result.data.account.last_name,
        paper: result.data.account.paper
      })
    })
      .catch((errorRes) => this.setState({error: errorRes.response.data.message}));
  }

  componentDidMount(): void {
    this.getAccountInfo();
  }

  render() {
    return (
      <div className="App">
        <div className='App-header'>
          {this.state.error ?
          <>
            {serverURL}
            <br/>
            {this.state.error}
          </> :
          <>
            {`Hello ${this.state.firstName} ${this.state.lastName}`}
            <br/>
            {`Logged in as ${this.state.email}`}
            <br/>
            {`Paper balance ${this.state.paper}`}
          </>
          }
        </div>
        <LoginForm/>
        <RegisterForm/>
      </div>
    );
  }

}
