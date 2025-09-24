import "./App.css";
import Header from "./components/header";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import History from "./pages/history"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

// A simple utility to check if the user is logged in
const isLoggedIn = () => {
  return localStorage.getItem('authToken'); // Check for auth token
};

// Protected Route component that redirects if user is not logged in
const ProtectedRoute = ({ element }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" />; // Redirect to login page if not logged in
  }
  return element; // If logged in, render the protected route
};

function App() {
  return (
    <Router>
      {localStorage.getItem('authToken')&&
      <Header />}
      {localStorage.getItem('authToken')&&
      <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/history" element={<ProtectedRoute element={<History />} />} />
        
        {/* Other protected routes can go here */}
        {/* Example: */}
        {/* <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
