// Signin.js
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './styles/signin.css';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email === '' || password === '') {
            setError('Email ve şifre alanları boş bırakılamaz.');
            return;
        }

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.email !== email || storedUser.password !== password) {
            setError('Geçersiz email veya şifre.');
            return;
        }

        // Başarılı login sonrası kullanıcı bilgilerini localStorage'e kaydetme
        localStorage.setItem('loggedInUser', JSON.stringify({ email, password }));
        // Başarılı login sonrası yönlendirme
        navigate('/home');
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
