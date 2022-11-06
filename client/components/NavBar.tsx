export default function NavBar(props: {logged: boolean, paper: number}) {

  return (
    <div className='nav-bar'>
      {props.logged ?
      <>
      <div className='nav-bar-left'>
        <a href='/assets'>Assets</a>
        <a href='/pools'>Pools</a>
        <a href='/bids'>Bids</a>
        <a href='/contracts'>Contracts</a>
        <a href='/profile'>Profile</a>
      </div>
      {`${Math.trunc(props.paper * 100) / 100} 💵`}
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
