import React, { useState } from 'react';
import { authAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import './ManageUsers.css';

const ManageUsers = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'Employee' 
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const res = await authAPI.registerStaff(formData);
            setMessage(res.data.message || 'User created successfully!');
            setIsError(false);
            setFormData({ name: '', email: '', password: '', role: 'Employee' });
        } catch (err) {
            console.error("User creation error:", err);
            setMessage(err.response?.data?.message || "Error creating user");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content">
                <h1>Manage Staff Accounts</h1>
                <p>Create credentials for Employees and Security personnel.</p>

                <div className="form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                required 
                                disabled={loading}
                            />
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                required 
                                disabled={loading}
                            />
                        </div>
                        <div className="input-group">
                            <label>Initial Password</label>
                            <input 
                                type="password" 
                                value={formData.password} 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                required 
                                disabled={loading}
                            />
                        </div>
                        <div className="input-group">
                            <label>System Role</label>
                            <select 
                                value={formData.role} 
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                disabled={loading}
                            >
                                <option value="Employee">Employee</option>
                                <option value="Security">Security</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                    {message && (
                        <p className="form-msg" style={{ 
                            color: isError ? '#dc2626' : '#16a34a',
                            background: isError ? '#fee2e2' : '#dcfce7',
                            padding: '10px',
                            borderRadius: '5px',
                            marginTop: '15px'
                        }}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;