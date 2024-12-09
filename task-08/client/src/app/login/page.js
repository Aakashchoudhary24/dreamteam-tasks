'use client';

import '../styles/forms.css';
import '../globals.css';
import Navbar from '../components/navbar';
import { useState } from 'react';

export default function LoginPage() {
    const [error, setError] = useState('');

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const formData = new FormData(event.target);
        const username = formData.get('username').toLowerCase();
        const password = formData.get('password');

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('access_token', data.access_token);
                alert('Login successful! Redirecting...');
                window.location.href='/';
            } else {
                setError(data.error || 'Invalid username or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="main">
            <Navbar />
            <div className="form-container">
                <form onSubmit={handleLoginSubmit} method="POST" className="login-form">
                    <h1 className="form-title">LOGIN</h1>

                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

                    <div className="form-actions">
                        <button type="submit" className="submit-button">SUBMIT</button>
                        <p className="redirect-link">
                            Don't have an account? <a href="/register">Register</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
