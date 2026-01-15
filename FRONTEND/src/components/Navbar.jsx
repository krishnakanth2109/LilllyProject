import React from 'react';
import './Navbar.css';
import { UserCircle } from 'lucide-react'; // Optional: if you have lucide-react installed

const Navbar = () => {
    // Get data from localStorage
    const userName = localStorage.getItem('userName') || 'User';
    const role = localStorage.getItem('role') || 'Staff';

    return (
        <nav className="navbar">
            <div className="nav-left">
                <span className="welcome-text">Welcome back, <strong>{userName}</strong></span>
            </div>
            <div className="nav-right">
                <div className="user-info">
                    <div className="user-details">
                        <p className="user-name">{userName}</p>
                        <p className={`user-role role-${role.toLowerCase()}`}>{role}</p>
                    </div>
                    <div className="user-avatar">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;