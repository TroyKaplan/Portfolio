import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="content-wrapper">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;

