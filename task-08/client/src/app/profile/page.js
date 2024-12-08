'use client';

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import "../styles/profile.css";

export default function ProfilePage() {
    const [username, setUsername] = useState(''); 

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem('access_token');
                {/* error being shown in this line - subject must be a string and UNPROCESSABLE ENTITY 422, unable to fix yet*/}
                const response = await fetch('http://localhost:5000/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                console.log(data); {/* printing the data to console cos I can't resolve the error*/}
                if (response.ok) {
                    setUsername(data.user.username);
                } else {
                    console.log('Error fetching profile:');
                }
            } catch (error) {
                console.log('An error occurred');
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
