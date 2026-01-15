import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const role = localStorage.getItem('role');
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate('/');
    };

    const goToDashboard = () => {
        if (role === 'Admin') navigate('/admin-dashboard');
        else if (role === 'Employee') navigate('/employee-dashboard');
        else if (role === 'Security') navigate('/security-dashboard');
    };

    return (
        <div className="sidebar">
            <h2>VPMS</h2>
            <nav>
                <div className="menu-item active" onClick={goToDashboard}>
                    Dashboard
                </div>

                {role === 'Admin' && (
                    <div className="menu-item" onClick={() => navigate('/manage-users')}>
                        Manage Users
                    </div>
                )}

                {role === 'Employee' && (
                    <div
                        className="menu-item"
                        onClick={() => navigate('/employee-overview')}
                    >
                        My Visitors
                    </div>
                )}

                {role === 'Security' && (
                    <div className="menu-item" onClick={() => navigate('/security-overview')}>
                        My Overview
                    </div>
                )}

            </nav>

            <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
    );
};

export default Sidebar;
