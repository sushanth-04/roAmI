import { useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import './login.css';
import { useNavigate } from 'react-router-dom';

export default function Login({ setAuthToken }) {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
            alert('Login successful!');
            localStorage.setItem('authToken', response.data.authtoken);
            setAuthToken(response.data.authtoken);  // Update authToken state
            navigate('/');  // Navigate to home after successful login
        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data.error || 'An error occurred');
            } else {
                setErrorMessage('Network error. Please try again later.');
            }
        }
    };

    return (
        <div className="login-main">
            <div className="login-main-one">
                {/* <img src={logo} alt="Logo" /> */}
                <h1>roAmI</h1>
            </div>
            <div className="login-main-two">
                <div className="login-card">
                    <h2>Login</h2>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    <form className='login-form' onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="email"
                            placeholder='Enter your email'
                            onChange={handleChange}
                            value={credentials.email}
                            required
                            className='id-and-pass'
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className='id-and-pass'
                            placeholder='Enter your password'
                            onChange={handleChange}
                            value={credentials.password}
                            required
                        />
                        <div className="show-pass">
                            <input
                                type="checkbox"
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <p>Show Password?</p>
                        </div>
                        <button className='login-button' type="submit">Login</button>
                    </form>
                    <p><a href="/signup" className="signup-link">Don't have an account?</a></p>
                </div>
            </div>
        </div>
    );
}
