import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Use NavLink to highlight active routes
import './navbar.css';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false); // To control dropdown visibility
  const navigate = useNavigate(); // To programmatically navigate after logout

  // Logout function that removes authToken and redirects to home page
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove authToken from localStorage
    setShowDropdown(false); // Close the dropdown
    location.reload();
  };

  return (
    <div className="nav-main">
      {/* Using NavLink for active route styling */}
      <NavLink to="/" activeClassName="active" exact>Home</NavLink>
      <NavLink to="/history" activeClassName="active">History</NavLink>

      <div className="user-dropdown" onClick={() => setShowDropdown(!showDropdown)}>
        <span>User</span> {/* This acts as the user clickable link */}
        {showDropdown && (
          <div className="dropdown-menu">
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
