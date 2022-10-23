import React from 'react';
import './App.css';
import axios from './lib/axios';
import { serverURL } from './config';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AssetList from './components/Asset/AssetList';

type Props = {}

type State = {
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
        this.setState({
          email: result.data.account.email,
          firstName: result.data.account.firstName,
          lastName: result.data.account.lastName,
          paper: result.data.account.paper,
          error: ''
        });
    })
    .catch((errorRes) => {
      console.log(errorRes);
      let error = '';
      if (errorRes.response && errorRes.response.data && errorRes.response.data.message) {
        error = errorRes.response.data.message;
      } else {
        error = errorRes.message;
      }
      this.setState({error});
    });
  }

  componentDidMount(): void {
    this.getAccountInfo();
  }

  render() {
    return (
      <div className="App">
        <div className='App-header'>
          {this.state.error ?
          <div className='error-message'>
            {serverURL}
            <br/>
            {this.state.error}
          </div> :
          <>
            {`Hello ${this.state.firstName} ${this.state.lastName}`}
            <br/>
            {`Logged in as ${this.state.email}`}
            <br/>
            {`Paper balance ${this.state.paper}`}
          </>
          }
        </div>
        <LoginForm
          submitCallback={this.getAccountInfo}
        />
        <RegisterForm
          submitCallback={this.getAccountInfo}
        />
        <AssetList/>
      </div>
    );
  }

}
