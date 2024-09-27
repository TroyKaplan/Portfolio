import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar" aria-label="Main navigation">
            <div className="nav-logo">
                <NavLink to="/">[Your Logo or Name]</NavLink>
            </div>
            <div className="nav-links">
                <NavLink
                    to="/games"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    Games
                </NavLink>
                <NavLink
                    to="/resume"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    Resume
                </NavLink>
                <NavLink
                    to="/gallery"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    Gallery
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;
