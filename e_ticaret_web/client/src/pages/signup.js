// Signup.js
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './styles/signup.css';
import axios from 'axios';

// SignupAPI that uses email, name, and password as parameters
const SignupAPI = async (email, username, password) => {
    try {
        const response = await axios.post('http://localhost:3001/signup', { email, username, password });
        console.log(response);
        if (response.status !== 200) {
            // get the message from the response, data is the response body
            const message = response;
            console.error('Error:', message);
            // throw an error with the message
            throw new Error(message);
        }

        const data = response.data;
        return 1;
    } catch (error) {
        // get the message from the response, data is the response body
        const message = error.response.data.message;
        console.error('Error:', message);
        // throw an error with the message
        alert("Error: " + message);
        return Number(0);
    }
};

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name === '' || email === '' || password === '') {
            setError('İsim, email ve şifre alanları boş bırakılamaz.');
            return;
        }

        // Kullanıcı bilgilerini bir nesne olarak oluştur
        const newUser = {
            name: name,
            email: email,
            password: password
        };

        // Send the user data to the SignupAPI function and wait for the response
        const response = await SignupAPI(newUser.email, newUser.name, newUser.password);

        console.log("response: " + response);

        // if the response is successful, go to the home page else show an error message as a popup
        if (response === 1) {
            // Signup successful, navigate to login page
            navigate('/');
        }
    };

    return (
        <div className="signup-container">
            <h2>Welcome</h2>
            <h3>Signup</h3>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input 
                        type="text" 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </div>
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
                <button type="submit" className="signup-button">Signup</button>
            </form>
        </div>
    );
}

export default Signup;
