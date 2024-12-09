'use client';

import Link from 'next/link';
import '../styles/navbar.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter(null);
  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <nav className='navbar'>
      <div className='container' id='nav-container'>
        <div className='logo'>
          <span>CineVerse</span>
        </div>

        {/* Hamburger Menu Button */}
        <div className='hamburger-menu' onClick={toggleMenu}>
          <div className={`hamburger-icon ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className={`links ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li>
              <Link href='/' onClick={closeMenu}>HOME</Link>
            </li>
            <li>
              <Link href='/lists' onClick={closeMenu}>LISTS</Link>
            </li>
            <li>
              <Link href='/films' onClick={closeMenu}>FILMS</Link>
            </li>
            {!isAuthenticated && (
              <li>
                <Link href='/login' onClick={closeMenu}>LOGIN</Link>
              </li>
            )}
            {!isAuthenticated && (
              <li>
                <Link href='/register' onClick={closeMenu}>REGISTER</Link>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <Link href='/watchlist' onClick={closeMenu}>WATCHLIST</Link>
              </li>
            )}
            <li>
              <Link href='/track' onClick={closeMenu}>TRACK</Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link href='/profile'>PROFILE</Link>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <button className='nav-button' onClick={handleLogout}>LOGOUT</button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
