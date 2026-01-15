import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './ManageUsers.css';

const ManageUsers = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Employee' });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register-staff', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            setFormData({ name: '', email: '', password: '', role: 'Employee' });
        } catch (err) {
            setMessage(err.response?.data?.message || "Error creating user");
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
                            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                        </div>
                        <div className="input-group">
                            <label>Initial Password</label>
                            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        </div>
                        <div className="input-group">
                            <label>System Role</label>
                            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                <option value="Employee">Employee</option>
                                <option value="Security">Security</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-save">Create Account</button>
                    </form>
                    {message && <p className="form-msg">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;