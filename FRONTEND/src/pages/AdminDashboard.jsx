import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout'; 
import './AdminDashboard.css'; 

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalVisitors: 0, todayVisitors: 0, activeVisitors: 0 });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAdminData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("No Access Token found. Please Login.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('http://localhost:5001/api/visitors/admin-logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
            setLogs(res.data.logs);
            setError(null);
        } catch (err) {
            console.error("Admin fetch error:", err);
            setError(err.response?.data?.message || "Failed to load Admin Data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdminData(); }, []);

    // Helper to format Date objects into readable Time (e.g., 10:30 AM)
    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <Layout title="Admin Overview"><div className="p-4">Loading Admin Data...</div></Layout>;

    if (error) return (
        <Layout title="Admin Overview">
            <div className="p-4 text-red-600 bg-red-100 border border-red-400 rounded"><strong>Error:</strong> {error}</div>
        </Layout>
    );

    const getStatusClass = (status) => {
        if (status === 'Checked-In') return 'status-active';
        if (status === 'Checked-Out') return 'status-checkout';
        return 'status-pending';
    };

    return (
        <Layout title="Admin Overview">
            <div className="stats-grid">
                <div className="admin-stat-card" style={{ borderLeftColor: '#2563eb' }}>
                    <h4>Total Lifetime Visits</h4>
                    <p>{stats.totalVisitors}</p>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: '#10b981' }}>
                    <h4>Visitors Today</h4>
                    <p>{stats.todayVisitors}</p>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: '#f97316' }}>
                    <h4>Currently Inside</h4>
                    <p>{stats.activeVisitors}</p>
                </div>
            </div>

            <div className="table-section">
                <h3>Visitor Access Logs</h3>
                <div className="log-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Visitor ID</th>
                                <th>Full Name</th>
                                <th>Status</th>
                                <th>Host</th>
                                <th>Entry Allowed By</th>
                                <th>Entry Time</th>
                                <th>Exit Allowed By</th>
                                <th>Exit Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id}>
                                    <td>{log.visitorId}</td>
                                    <td>{log.fullName}</td>
                                    <td>
                                        <span className={`status ${getStatusClass(log.status)}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td>{log.host ? log.host.name : 'Unknown'}</td>
                                    
                                    {/* Entry Details */}
                                    <td className="text-sm text-gray-500">
                                        {log.entryScannedBy ? log.entryScannedBy.name : '-'}
                                    </td>
                                    <td className="text-sm font-medium">
                                        {formatTime(log.entryTime)}
                                    </td>

                                    {/* Exit Details */}
                                    <td className="text-sm text-gray-500">
                                        {log.exitScannedBy ? log.exitScannedBy.name : '-'}
                                    </td>
                                    <td className="text-sm font-medium">
                                        {formatTime(log.exitTime)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;