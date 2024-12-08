'use client';
import Navbar from './components/navbar';
import './styles/page.css';
import { useState, useEffect } from 'react';

export default function Home() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);
  
  return (
    <div className='main'>
      <Navbar/>

        <div className='sell'>
        <p>Find your favorite films. <br></br>
          Track films you've watched. <br></br>
        Save those you want to see. <br></br>
        </p>
      </div>

        <div className='features'>
          <div className='feature'>
            <p>Keep track of every film you've ever watched (or just start from when
              you join)</p>
          </div>
          <div className='feature'>
            <p>Find all your favorite movies, series, documentaries and many more
            </p>
          </div>
          <div className='feature'>
            <p>Rate each film on a five-star scale (with halves) to record
              and share your reaction
            </p>
          </div>
          <div className='feature'>
            <p>Create lists of films on any topic
              and keep a watchlist of films to see
            </p>
          </div>
        </div>

      <div>
        <p></p>
      </div>

    </div>
  );
}