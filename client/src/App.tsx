import React from 'react';
import './App.css';
import axios from 'axios';
import { serverURL } from './config';

axios.defaults.withCredentials = true;

type Props = {}

type State = {
  accountId: number,
  email: string,
  firstName: string,
  lastName: string,
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
        lastName: result.data.account.last_name
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
          </>
          }

        </div>
      </div>
    );
  }

}
