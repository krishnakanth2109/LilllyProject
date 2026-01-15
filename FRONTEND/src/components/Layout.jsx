import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar'; // Ensure you have this component
import './Layout.css'; // Make sure to import the CSS file

const Layout = ({ children, title }) => {
    const role = localStorage.getItem('role');

    return (
        <div className="layout-wrapper">
            {/* Sidebar stays fixed on the left */}
            <Sidebar role={role} />

            {/* Main Content Area goes on the right */}
            <div className="main-content-wrapper">
                <Navbar />
                
                <div className="page-scroll-container">
                    <div className="page-header">
                        <h2>{title}</h2>
                    </div>
                    <div className="page-body">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;