'use client';

import React, { useState } from 'react';
import '../styles/forms.css'
import Navbar from '../components/navbar';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); 
        setErrorMessage('');
        setSuccess('');

        const { username, password, confirmPassword } = formData;

        if (password !== confirmPassword) {
            window.alert("Passwords do not match");
            return;
        }
        const lowercaseUsername = username.toLowerCase();

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: lowercaseUsername, password }),
            });

            if (response.ok) {
                alert("Registration successful! Please log in.");
                setFormData({ username: '', password: '', confirmPassword: '' });
                window.location.href = '/login';
            } else {
                window.alert('Please choose a different username');
                setFormData({ username:'', password:'', confirmPassword:''});
            }
        } catch (err) {
            setErrorMessage("Failed to connect to the server");
        }
    };

    return (
        <div className="main">
            <Navbar />
            <div className="form-container">
                <form onSubmit={handleSubmit} className="register-form">
                    <h1 className="form-title">Register</h1>
                    {errorMessage && <p className="error-message" style={{color:'red'}}>{errorMessage}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirm-password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-button">SUBMIT</button>
                        <p className="redirect-link">
                            Already have an account? <a href="/login">Login</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

