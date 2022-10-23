export default function NavBar(props: {render: JSX.Element}) {

  return (
    <div className='nav-bar'>
      {props.render}
    </div>
  )
};