import { useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import './login.css';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        phn: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');  // State to store error message
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        console.log("Form Data: ", formData);  // Log the data being sent
      
        // Password mismatch validation
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
      
        try {
          const response = await axios.post('http://localhost:3000/api/carProviders/create', {
            name: formData.name,
            phn: formData.phn,
            email: formData.email,
            password: formData.password
          });
      
          alert('Signup successful!');
          localStorage.setItem('authToken', response.data.authToken);
          navigate('/');
        } catch (error) {
          console.error(error.response.data); // Log error response
          alert('Signup failed. Please check your details and try again!');
        }
      };
      
    

    return (
        <div className="login-main">
            <div className="login-main-one">
                {/* <img src={logo} alt="Logo" /> */}
                <h1>roAmI</h1>
            </div>
            <div className="login-main-two">
                <div className="login-card signup">
                    <h2>Signup</h2>
                    <form className='login-form' onSubmit={handleSubmit}>
                        {/* Input fields for user data */}
                        <input
                            type="text"
                            name="name"
                            placeholder='Enter your full name'
                            onChange={handleChange}
                            required
                            className='id-and-pass'
                        />
                        <input
                            type="text"
                            name="phn"
                            placeholder='Enter your phone number'
                            onChange={handleChange}
                            required
                            className='id-and-pass'
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder='Enter your email'
                            onChange={handleChange}
                            required
                            className='id-and-pass'
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder='Enter your password'
                            onChange={handleChange}
                            required
                            className='id-and-pass'
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder='Confirm your password'
                            onChange={handleChange}
                            required
                            className='id-and-pass'
                        />
                        <button className='login-button' type="submit">Register</button>
                    </form>
                    {error && <p className="error-message">{error}</p>}  {/* Display error message */}
                    <p>
                        <a href="/login" className="signup-link">Have an account? Login here</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
