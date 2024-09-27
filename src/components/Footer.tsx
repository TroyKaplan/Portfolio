import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} [Your Name]. All rights reserved.</p>
                <div className="social-links">
                    <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                    <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">
                        LinkedIn
                    </a>
                    {/* Add more social links as needed */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
