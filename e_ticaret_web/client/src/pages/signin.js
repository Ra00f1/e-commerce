// Signin.js
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './styles/signin.css';
import axios from "axios";

// Login function using Axios (similar to SignupAPI)
const LoginAPI = async (email, password) => {
    try {
        const response = await axios.post('http://localhost:3001/login', { email, password });
        if (response.status !== 200) {
            // get the message from the response, data is the response body
            const message = response.data.message;
            console.error('Error:', message);
            throw new Error(message);
        }

        const data = response.data;
        return data; // Return user data or success message
    } catch (error) {
        // get the message from the response, data is the response body
        const message = error.response.data.message;
        console.error('Error:', message);
        return null; // Indicate login failure
    }
};

function Login(email, password) {
    return LoginAPI(email, password)
        .then(data => {
            if (data) {
                // Login successful
                console.log("Login successful!");

                return data; // Return user data for further actions
            } else {
                // Login failed, handle error
                console.error("Login failed.");
                return null;
            }
        });
}

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email === '' || password === '') {
            setError('Email ve şifre alanları boş bırakılamaz.');
            return;
        }

        // Send the login data using LoginAPI and handle response
        const userData = await Login(email, password);

        if (userData) {
            // Login successful, store user data and navigate
            localStorage.setItem('userData', JSON.stringify(userData.data));
            navigate('/home');
        } else {
            // Login failed, set error message
            setError('Geçersiz email veya şifre.');
        }
    };
    return (
        <div className="signin-container">
            <h2>Welcome</h2>
            <h3>Signin</h3>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="signin-button">Signin</button>
            </form>
            <p>Don't you have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
    );
}

export default Signin;
