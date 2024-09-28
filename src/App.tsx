import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import ResumePage from './pages/ResumePage';
import GalleryPage from './pages/GalleryPage';
import './App.css';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="app-container">
                    <Navbar />
                    <div className="content-wrapper">
                        <Routes>
                            <Route path="/Portfolio" element={<HomePage />} />
                            <Route path="/games" element={<GamesPage />} />
                            <Route path="/resume" element={<ResumePage />} />
                            <Route path="/gallery" element={<GalleryPage />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
