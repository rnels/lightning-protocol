import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Link,
} from "react-router-dom";

import './App.css';
import axios from './lib/axios';
import { serverURL } from './config';

import LoginForm from './components/User/LoginForm';
import RegisterForm from './components/User/RegisterForm';
import AssetList from './components/Asset/AssetList';
import NavBar from './components/NavBar';
// import UserContractList from './components/Contract/UserContractList';
import AssetDetails from './components/Asset/AssetDetails';
import AssetPoolList from './components/Pool/AssetPoolList';
import ContractTypeList from './components/Contract/ContractType/ContractTypeList';
import ContractList from './components/Contract/ContractList';
import AssetContractsView from './components/Views/AssetContractsView';
import PlaceBidView from './components/Views/PlaceBidView';

type Props = {}

type State = {
  email: string,
  firstName: string,
  lastName: string,
  paper: number,
  error: string
}

export default class App extends React.Component<Props, State> {

  router: any;

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
    // this.router = createBrowserRouter([
    //   {
    //     path: '/',
    //     element: ( // TODO: Don't display login / register if they are already logged in, take them straight to app
    //       <>
    //         <h1>Lightning Protocol</h1>
    //         <Link to='login'>Login</Link>
    //         <Link to='register'>Register</Link>
    //         <Link to='assets'>Launch App</Link>
    //       </>
    //     ),
    //   },
    //   {
    //     path: 'login',
    //     element:
    //       <LoginForm // TODO: Redirect to /app on login
    //         submitCallback={this.getAccountInfo}
    //       />
    //   },
    //   {
    //     path: 'register',
    //     element:
    //       <RegisterForm // TODO: Redirect to /app on registration
    //         submitCallback={this.getAccountInfo}
    //       />
    //   },
    //   {
    //     path: 'assets',
    //     element: <AssetList/>
    //   },
    //   {
    //     path: 'assets/:assetId',
    //     element: <AssetDetails/>,
    //     children: [
    //       {
    //         path: 'pools',
    //         element: <AssetPoolList/>
    //       },
    //       {
    //         path: 'contracts',
    //         element: <ContractTypeList/>,
    //         children: [
    //           {
    //             path: ':typeId',
    //             element: <TypeContractList/>
    //           }
    //         ]
    //       }
    //     ]
    //   }
    // ]);
    this.router = createBrowserRouter([
      {
        path: '/',
        element: ( // TODO: Don't display login / register if they are already logged in, take them straight to app
          <>
            <h1>Lightning Protocol</h1>
            <Link to='login'>Login</Link>
            <Link to='register'>Register</Link>
            <Link to='assets'>Launch App</Link>
          </>
        ),
      },
      {
        path: 'login',
        element:
          <LoginForm // TODO: Redirect to /app on login
            submitCallback={this.getAccountInfo}
          />
      },
      {
        path: 'register',
        element:
          <RegisterForm // TODO: Redirect to /app on registration
            submitCallback={this.getAccountInfo}
          />
      },
      {
        path: 'assets',
        element: <AssetList/>
      },
      {
        path: 'assets/:assetId',
        element: <AssetContractsView/>
      },
      {
        path: 'assets/:assetId/bid/:typeId',
        element: <PlaceBidView/>
      }
    ]);
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
        <NavBar/>
        <RouterProvider router={this.router}/>
      </div>
    );
  }

}
