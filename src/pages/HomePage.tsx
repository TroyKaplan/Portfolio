import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
    return (
        <div className="home-page">
            <section className="intro">
                <h1>Welcome to My Portfolio</h1>
                <p>
                    Hi! I'm Troy Kaplan, a passionate game developer and designer. Explore my games,
                    and view my gallery of work.
                </p>
            </section>

            <section className="navigation-links">
                <Link to="/games" className="nav-link">
                    <h2>Games</h2>
                    <p>Play both Single Player and Multiplayer games in your browser!</p>
                </Link>
                {/*<Link to="/resume" className="nav-link">
                    <h2>Resume</h2>
                    <p>View my professional experience and skills.</p>
                </Link>*/}
                <Link to="/gallery" className="nav-link">
                    <h2>Gallery</h2>
                    <p>Images, videos, projects and games that can't be shown in the games section.</p>
                </Link>
                <Link to="/tutorials" className="nav-link">
                    <h2>Tutorials</h2>
                    <p>Explore tutorials for C++, Unreal Engine, and more!</p>
                </Link>
            </section>
        </div>
    );
};

export default HomePage;
