import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} Troy Kaplan. All rights reserved.</p>
                <div className="social-links">
                    <a href="https://github.com/TroyKaplan" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                    <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">
                        LinkedIn
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

