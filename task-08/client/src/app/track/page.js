'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/navbar'; 
import '../styles/track.css';
import '../styles/forms.css';

export default function TrackPage() {
    const [tracks, setTracks] = useState([]);
    const [showAddTrackForm, setShowAddTrackForm] = useState(false);
    const [formData, setFormData] = useState({
        movieName: '',
        genre: '',
        summary: '',
    });
    const token = sessionStorage.getItem('access_token');
    const fetchTracks = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/track', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            const data = await response.json();
            console.log('Full Response:', response);
            console.log('Response Data:', data);
    
            if (response.ok) {
                setTracks(data.tracks);
            } else {
                console.log('Failed to fetch tracks:', data);
            }
        } catch (error) {
            console.log('Error fetching tracks:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTracks();
        }
    }, []);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevTrack) => ({
            ...prevTrack,
            [name]: value,
        }));
    };

    const handleAddTrack = async (e) => {
        e.preventDefault();
        console.log('Sent track data:', formData);
        const { movieName, genre, summary } = formData;
    
        if (!movieName || !summary) {
            alert("Movie name and summary are required!");
            return;
        }
        if (typeof movieName !== 'string' || typeof summary !== 'string') {
            alert("Movie name and summary must be strings!");
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/track', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movieName: movieName.trim(),
                    genre: genre ? genre.trim() : '', 
                    summary: summary.trim()
                })
            });
    
            if (response.ok) {
                alert('Track added successfully!');
                setFormData({
                    movieName: '',
                    genre: '',
                    summary: '',
                });
                setShowAddTrackForm(false);
                fetchTracks();
            } else {
                console.log('Error adding track:');
                alert('Failed to add track');
            }
        } catch (error) {
            console.log('Network or parsing error:', error);
            alert('An error occurred while adding the track');
        }
    };

    return (
        <div className='main'>
            <Navbar/>
            <div className="track-page">
            <h1>Your Movie Track</h1>
            <button onClick={() => setShowAddTrackForm(!showAddTrackForm)}>
                {showAddTrackForm ? 'Cancel' : 'Add Track'}
            </button>

            {showAddTrackForm && (
                <form onSubmit={handleAddTrack} className="form-container">
                    <div className="form-group">
                        <label>Movie Name:</label>
                        <input
                            type="text"
                            name="movieName"
                            value={formData.movieName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Genre (optional):</label>
                        <input
                            type="text"
                            name="genre"
                            value={formData.genre}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Summary:</label>
                        <textarea
                            name="summary"
                            value={formData.summary}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button type="submit">Add Track</button>
                </form>
            )}

            <div className="track-list">
                {!showAddTrackForm && tracks.length === 0 ? (
                    <p>No tracks found. Add a new track to get started!</p>
                ) : (
                    tracks.map(track => (
                        <div key={track.id} className="track">
                            <h3>{track.movieName}</h3>
                            <p>{track.genre || 'Genre not specified'}</p>
                            <p>{track.summary}</p>
                        </div>
                    ))
                )}
            </div>

            </div>
        </div>
    );
}
