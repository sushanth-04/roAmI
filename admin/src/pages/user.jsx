import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './user.css'; // Make sure to style it in your CSS file

export default function User() {
  const [users, setUsers] = useState([]);

  // Fetch user data from the API
  useEffect(() => {
    axios.get('http://localhost:3000/api/admin/users') // Make sure the URL matches your backend endpoint
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  return (
    <div className="user-container">
      {users.map(user => (
        <div key={user._id} className="user-card">
          <div className="user-info">
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phn}</p>
            {/* <p>Plan: {user.plan ? JSON.stringify(user.plan) : 'No plan assigned'}</p> */}
            <p>Registered on: {new Date(user.date).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
