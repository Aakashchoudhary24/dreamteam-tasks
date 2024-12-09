'use client';

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import "../styles/profile.css";

export default function ProfilePage() {
    const [username, setUsername] = useState(''); 

    useEffect(() => {
        const token = sessionStorage.getItem('access_token');
        console.log('Token in ProfilePage:', token);
    }, []);
    

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem('access_token')
                if (!token) {
                    console.log('No token found');
                    return;
                }
                const response = await fetch('http://localhost:5000/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.user.username);
                } else if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('access_token');
                    window.location.href = '/login';
                } else {
                    console.log('Error fetching profile:', response.status, response.statusText);
                }
            } catch (error) {
                console.log('An error occurred:', error);
            }
        };
    
        fetchProfile();
    }, []);
    
    return (
        <div className="main">
            <Navbar />
            <div className="profile">
                <p id="username">{username || 'Loading...'}</p>
            </div>
        </div>
    );
}
