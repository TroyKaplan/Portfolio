import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './features/home/pages/HomePage';
import GamesPage from './features/games/pages/GamesPage';
import GalleryPage from './features/gallery/pages/GalleryPage';
import TutorialsPage from './features/tutorials/pages/TutorialsPage';
import './App.css';
import PrivateRoute from './PrivateRoute';
import SubscriptionPage from './features/subscription/pages/SubscriptionPage';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import AdminControlPage from './features/admin/pages/AdminControlPage';
import UserProfile from './features/profile/pages/UserProfile';
import UserDetails from './features/admin/pages/UserDetails';
import ErrorBoundary from './features/layout/components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './features/layout/components/MainLayout';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="/games" element={<GamesPage />} />
                        <Route path="/gallery" element={<GalleryPage />} />
                        <Route path="/tutorials" element={<TutorialsPage />} />
                        <Route path="/subscribe" element={<SubscriptionPage />} />

                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route
                            path="/admin"
                            element={
                                <PrivateRoute role="admin">
                                    <AdminDashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/control"
                            element={
                                <PrivateRoute role="admin">
                                    <AdminControlPage />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/admin/users/:userId" element={
                            <PrivateRoute role="admin">
                                <UserDetails />
                            </PrivateRoute>
                        } />

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
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
