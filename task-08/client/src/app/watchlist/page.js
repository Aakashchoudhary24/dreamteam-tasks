'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import '../styles/watchlist.css';

export default function WatchList() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const storedToken = sessionStorage.getItem('access_token');
        if (storedToken) {
            setToken(storedToken);
        } else {
            setError('Please log in');
        }

        fetchProfile();
        fetchTasks();
    }, [token]);

    const fetchProfile = async () => {
        if (!token) return;
        
        try {
            console.log('Token:', token);
    
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            console.log('Response status:', response.status);
    
            const responseData = await response.json();
            console.log('Response data:', responseData);
        
            if (response.ok) {
                setUsername(responseData.user.username);
            } else {
                setError(`Failed to fetch profile: ${responseData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.log('Profile fetch error:', err);
            setError('An error occurred while fetching profile');
        }
    };

    const fetchTasks = async () => {
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5000/api/tasks', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTasks(data.tasks);
            } else {
                setError('Failed to fetch tasks');
            }
        } catch (err) {
            setError('An error occurred while fetching tasks');
        }
    };

    const handleAddTask = async (event) => {
        event.preventDefault();
        setError('');

        if (!newTask.trim()) {
            setError('Task cannot be empty');
            return;
        }

        try {
            if (!token) {
                setError('Please log in to add tasks');
                return;
            }

            const response = await fetch('http://localhost:5000/api/tasks', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    description: newTask,
                    status: 'Pending' 
                })
            });

            if (response.ok) {
                const newTaskData = await response.json();
                setTasks([...tasks, newTaskData.task]);
                setNewTask('');
            } else {
                setError('Failed to add task');
            }
        } catch (err) {
            setError('An error occurred while adding task');
        }
    };

    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        try {
            if (!token) {
                setError('Please log in to update tasks');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const updatedTasks = tasks.map(task => 
                    task.id === taskId ? {...task, status: newStatus} : task
                );
                setTasks(updatedTasks);
            } else {
                setError('Failed to update task status');
            }
        } catch (err) {
            setError('An error occurred while updating task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            if (!token) {
                setError('Please log in to delete tasks');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const filteredTasks = tasks.filter(task => task.id !== taskId);
                setTasks(filteredTasks);
            } else {
                setError('Failed to delete task');
            }
        } catch (err) {
            setError('An error occurred while deleting task');
        }
    };

    return (
        <div className="main">
            <Navbar />
            <div className="watchList-container">
                <h1>Watchlist Tasks {username && `- ${username}'s List`}</h1>
                
                <form onSubmit={handleAddTask} className="add-task-form">
                    <input 
                        type="text" 
                        value={newTask} 
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a new task to your Watch-list"
                    />
                    <button type="submit">Add Task</button>
                </form>

                {error && <p className="error-message">{error}</p>}

                <div className="tasks-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {tasks.map((task, index) => (
                            <tr key={task.id || index}>
                            <td>{task.description || 'No description'}</td>
                            <td>{task.status || 'No status'}</td>
                            <td>
                                <select value={task.status} onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}>
                                    <option value="Pending">Pending</option>
                                    <option value="Watching">Watching</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                            </td>
                        </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
