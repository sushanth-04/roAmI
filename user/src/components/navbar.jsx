import { NavLink } from 'react-router-dom'; // Import NavLink from react-router-dom
import './navbar.css';

export default function Navbar() {
  return (
    <div className="nav-main">
      <NavLink exact to="/" activeClassName="active">Home</NavLink>
      <NavLink to="/plan" activeClassName="active">Plan with AI</NavLink>
      <NavLink to="/car" activeClassName="active">Rent a Car</NavLink>
      <NavLink to="/hotel" activeClassName="active">Book Hotel</NavLink>
    </div>
  );
}
