import * as api from './lib/api';
import './App.css';
import LoginForm from './components/User/LoginForm';
import RegisterForm from './components/User/RegisterForm';
import AssetList from './components/Asset/AssetList';
import NavBar from './components/NavBar';
import AssetContractsView from './components/Views/AssetContractsView';
import UserPoolList from './components/Pool/UserPoolList';
import PoolLockList from './components/Pool/PoolLock/PoolLockList';

// import UserContractList from './components/Contract/UserContractList';
// import AssetDetails from './components/Asset/AssetDetails';
// import AssetPoolList from './components/Pool/AssetPoolList';
// import ContractTypeList from './components/Contract/ContractType/ContractTypeList';
// import ContractList from './components/Contract/ContractList';
// import PlaceBidModal from './components/Views/PlaceBidModal';

import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Link,
} from "react-router-dom";

type Props = {}

type State = {
  logged: boolean,
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
      logged: false,
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
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
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
        // ,
        // children: [
        //   {
        //     path: 'bid/:typeId',
        //     element: <PlaceBidModal/>
        //   }
        // ]
      },
      {
        path: 'pools',
        element: <UserPoolList/>,
        children: [
          {
            path: ':poolId/locks',
            element: <PoolLockList/>
          }
        ]
      },
    ]);
  }

  getAccountInfo(): void {
    api.getAccount()
      .then((account) => {
        this.setState({
          logged: true,
          email: account.email,
          firstName: account.firstName,
          lastName: account.lastName,
          paper: account.paper,
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
        <NavBar
          logged={this.state.logged}
          paper={this.state.paper}
        />
        <RouterProvider router={this.router}/>
      </div>
    );
  }

}
