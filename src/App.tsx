import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import GalleryPage from './pages/GalleryPage';
import TutorialsPage from './pages/TutorialsPage';
import './App.css';
import PrivateRoute from './PrivateRoute';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './pages/UserProfile';
import UserDetails from './pages/UserDetails';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
                <Router>
                    <div className="app-container">
                        <Navbar />
                        <div className="content-wrapper">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/games" element={<GamesPage />} />
                                <Route path="/Gallery" element={<GalleryPage />} />
                                <Route path="/Tutorials" element={<TutorialsPage />} />
                                <Route
                                    path="/admin"
                                    element={
                                        <PrivateRoute role="admin">
                                            <AdminDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route 
                                    path="/profile" 
                                    element={
                                        <PrivateRoute>
                                            <ErrorBoundary>
                                                <UserProfile />
                                            </ErrorBoundary>
                                        </PrivateRoute>
                                    } 
                                />
                                <Route path="/subscribe" element={<SubscriptionPage />} />
                                <Route path="/admin/users/:userId" element={
                                    <PrivateRoute role="admin">
                                        <UserDetails />
                                    </PrivateRoute>
                                } />
                            </Routes>
                        </div>
                        <Footer />
                    </div>
                </Router>
        </AuthProvider>
    );
}

export default App;
