import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <nav className="navbar" aria-label="Main navigation">
            <div className="nav-logo">
                <NavLink to="">Troy Kaplan</NavLink>
            </div>
            <div className="nav-links">
                <NavLink to="/games" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Games
                </NavLink>
                <NavLink to="/resume" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Resume
                </NavLink>
                <NavLink to="/gallery" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Gallery
                </NavLink>
                <NavLink to="/tutorials" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Tutorials
                </NavLink>
                {/* Theme Toggle Button */}
                <button className="theme-toggle-button" onClick={toggleTheme} aria-label="Toggle Theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
