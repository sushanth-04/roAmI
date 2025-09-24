import './App.css';
import Header from './components/header';
import Navbar from './components/navbar';
import Home from './pages/home';
import Plan from './pages/plan';
import Car from './pages/car';
import Hotel from './pages/hotel';
import Login from './pages/login';
import Signup from './pages/signup';  // Import the Signup component
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// ProtectedRoute component to handle routes that require authentication
function ProtectedRoute({ element, ...rest }) {
  const authToken = localStorage.getItem('authToken');
  // If user is authenticated, render the protected component, else redirect to login
  return authToken ? element : <Navigate to="/login" />;
}

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

  // Update the authToken when it changes in localStorage
  useEffect(() => {
    setAuthToken(localStorage.getItem('authToken'));
  }, []);

  return (
    <Router>
      {authToken &&
      <Header />}
      {authToken &&
      <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={<ProtectedRoute element={<Home />} />}
        />
        <Route
          path="/plan"
          element={<ProtectedRoute element={<Plan />} />}
        />
        <Route
          path="/car"
          element={<ProtectedRoute element={<Car />} />}
        />
        <Route
          path="/hotel"
          element={<ProtectedRoute element={<Hotel />} />}
        />

        {/* Redirect to Home if route is not found */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;