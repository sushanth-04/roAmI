import './header.css';
import logo from '../assets/logo.png';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [userName, setUserName] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/getuser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.name);
        } else {
          console.error('Failed to fetch user');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (token) fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <header className="header-main">
      <div className="header-left">
        <h1 className="app-name">roAmI</h1>
      </div>

      <div className="header-right">
        <div className="user-menu" onClick={() => setDropdownVisible(!isDropdownVisible)}>
          <span className="user-name">{userName || 'Loading...'}</span>
          <i className="arrow-down">&#9662;</i>

          {isDropdownVisible && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
