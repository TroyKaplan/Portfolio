import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import ResumePage from './pages/ResumePage';
import GalleryPage from './pages/GalleryPage';
import TutorialsPage from './pages/TutorialsPage';
import './App.css';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="app-container">
                    <Navbar />
                    <div className="content-wrapper">
                        <Routes>
                            <Route path="" element={<HomePage />} />
                            <Route path="/Games" element={<GamesPage />} />
                            <Route path="/Resume" element={<ResumePage />} />
                            <Route path="/Gallery" element={<GalleryPage />} />
                            <Route path="/Tutorials" element={<TutorialsPage />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
