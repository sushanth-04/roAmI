import { useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import './login.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    // Update state to use 'email' instead of 'phone'
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Handle input changes for email and password
    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    // Handle form submission (login logic)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', credentials);

            alert('Login successful!');
            localStorage.setItem('authToken', response.data.authToken);
            
            navigate('/');
        } catch (error) {
            console.error(error.response.data);
            alert('Invalid email or password');
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
                    <form className='login-form' onSubmit={handleSubmit}>
                        {/* Use 'email' field instead of 'phone' */}
                        <input
                            type="email"
                            name="email"
                            placeholder='Enter your email'
                            onChange={handleChange}
                            required
                            className='id-and-pass'
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className='id-and-pass'
                            placeholder='Enter your password'
                            onChange={handleChange}
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
