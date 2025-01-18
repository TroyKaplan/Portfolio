import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Navbar: React.FC = () => {
    const { user, setUser } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="navbar" aria-label="Main navigation">
            <div className="nav-logo">
                {user ? (
                    <Link to="/profile" className="user-profile-link">
                        <span className="username">{user.username}</span>
                        {user.role === 'admin' && <span className="role-badge admin">Admin</span>}
                        {user.role === 'subscriber' && <span className="role-badge subscriber">Sub</span>}
                    </Link>
                ) : (
                    <Link to="">Guest</Link>
                )}
            </div>
            <div className="nav-links">
                <NavLink to="/games" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Games
                </NavLink>
                <NavLink to="/gallery" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Gallery
                </NavLink>
                <NavLink to="/tutorials" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Tutorials
                </NavLink>
            </div>
            <div className="nav-right">
                {user ? (
                    <button onClick={handleLogout}>Logout</button>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
