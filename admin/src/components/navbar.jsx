import { Link, useLocation } from 'react-router-dom'; // Import useLocation hook
import './navbar.css';

export default function Navbar() {
  const location = useLocation(); // Get the current location

  return (
    <div className="nav-main">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
      <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>Users</Link>
      <Link to="/car" className={location.pathname === '/car' ? 'active' : ''}>Car providers</Link>
      <Link to="/hotel" className={location.pathname === '/hotel' ? 'active' : ''}>Hotel Owners</Link>
    </div>
  );
}
