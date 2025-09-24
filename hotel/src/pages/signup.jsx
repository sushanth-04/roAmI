import { useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import './login.css';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phn: '',
        location: '',
        address: '',
        rent: '',
        rooms: '',
    });
    const [image, setImage] = useState(null); // Separate state for file upload

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]); // Store the uploaded file
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach((key) => data.append(key, formData[key]));
        if (image) {
            data.append('image', image); // Append the image file
        }

        try {
            const response = await axios.post('http://localhost:3000/api/hotels/createHotel', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert('Signup successful!');
            localStorage.setItem('authToken', response.data.token);
            navigate('/');
        } catch (error) {
            console.error(error.response?.data || error.message);
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
                    <form className="login-form" onSubmit={handleSubmit} encType="multipart/form-data">
                        <input type="text" name="name" placeholder="Enter Hotel Name" onChange={handleChange} required className="id-and-pass" />
                        <input type="email" name="email" placeholder="Enter Email" onChange={handleChange} required className="id-and-pass" />
                        <input type="password" name="password" placeholder="Enter Password" onChange={handleChange} required className="id-and-pass" />
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required className="id-and-pass" />
                        <input type="text" name="phn" placeholder="Enter Phone Number" onChange={handleChange} required className="id-and-pass" />
                        <input type="file" name="image" onChange={handleImageChange} accept="image/*" required className="id-and-pass" />
                        <input type="text" name="location" placeholder="Enter Location" onChange={handleChange} required className="id-and-pass" />
                        <input type="number" name="rent" placeholder="Rent per day" onChange={handleChange} required className="id-and-pass" />
                        <input type="text" name="address" placeholder="Enter Address" onChange={handleChange} required className="id-and-pass" />
                        <input type="number" name="rooms" placeholder="Enter Number of Rooms" onChange={handleChange} required className="id-and-pass" />
                        <button className="login-button" type="submit">Register</button>
                    </form>
                    <p>
                        <a href="/login" className="signup-link">Have an account? Login here</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
