import { Account } from "../lib/types";

export default function NavBar(props: {logged: boolean, paper: number}) {

  // TODO: Change this to use react router once I have a better understanding of it
  return (
    <div className='nav-bar'>
      {props.logged ?
      <>
      <div className='nav-bar-left'>
        <a href='/profile'>Profile</a>
        <a href='/assets'>Assets</a>
      </div>
      {`${props.paper} Paper`}
      </>
      :
      <>
        <a href='/login'>Login</a>
        <a href='/register'>Register</a>
      </>
      }
    </div>
  )
};