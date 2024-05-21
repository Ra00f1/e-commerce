// Signup.js
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './styles/signup.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name === '' || email === '' || password === '') {
            setError('İsim, email ve şifre alanları boş bırakılamaz.');
            return;
        }

        const existingUser = JSON.parse(localStorage.getItem('user'));
        if (existingUser && existingUser.email === email) {
            setError('Bu email adresi zaten kayıtlı.');
            return;
        }

        // Kullanıcı bilgilerini bir nesne olarak oluştur
        const newUser = {
            name: name,
            email: email,
            password: password
        };

        // LocalStorage'da kullanıcı bilgilerini sakla
        localStorage.setItem('user', JSON.stringify(newUser));

        // Başarılı signup sonrası yönlendirme
        navigate('/home');
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
