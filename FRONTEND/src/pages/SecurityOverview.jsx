import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
// Reusing Admin CSS for tables and cards to keep consistency
import './AdminDashboard.css'; 

const SecurityOverview = () => {
    // Default to today's date (YYYY-MM-DD format)
    const getTodayString = () => new Date().toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [stats, setStats] = useState({ totalActions: 0, entriesAllowed: 0, exitsAllowed: 0 });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await axios.get(`http://localhost:5001/api/visitors/security-stats`, {
                params: { date: selectedDate },
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
            setLogs(res.data.logs);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load history.");
        } finally {
            setLoading(false);
        }
    };

    // Refetch when date changes
    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    // Helper for time formatting
    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusClass = (status) => {
        if (status === 'Checked-In') return 'status-active';
        if (status === 'Checked-Out') return 'status-checkout';
        return 'status-pending';
    };

    return (
        <Layout title="My Activity Overview">
            
            {/* DATE FILTER */}
            <div className="filter-section" style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <label style={{ fontWeight: 'bold', color: '#475569' }}>Select Date:</label>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
                <button 
                    onClick={() => setSelectedDate(getTodayString())}
                    style={{ padding: '8px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Today
                </button>
            </div>

            {/* STATS CARDS */}
            <div className="stats-grid">
                <div className="admin-stat-card" style={{ borderLeftColor: '#2563eb' }}>
                    <h4>Total Scans Today</h4>
                    <p>{stats.totalActions}</p>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: '#10b981' }}>
                    <h4>Entries Allowed</h4>
                    <p>{stats.entriesAllowed}</p>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: '#f97316' }}>
                    <h4>Exits Allowed</h4>
                    <p>{stats.exitsAllowed}</p>
                </div>
            </div>

            {/* LOGS TABLE */}
            <div className="table-section">
                <h3>Work Log ({selectedDate})</h3>
                {loading ? <p>Loading records...</p> : (
                    <div className="log-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Visitor ID</th>
                                    <th>Full Name</th>
                                    <th>Status</th>
                                    <th>Host</th>
                                    <th>Entry Time</th>
                                    <th>Exit Allowed By</th>
                                    <th>Exit Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? logs.map(log => (
                                    <tr key={log._id}>
                                        <td style={{ fontWeight: 'bold' }}>{log.visitorId}</td>
                                        <td>{log.fullName}</td>
                                        <td>
                                            <span className={`status ${getStatusClass(log.status)}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td>{log.host ? log.host.name : 'Unknown'}</td>
                                        
                                        {/* Entry Time */}
                                        <td style={{ color: '#166534', fontWeight: '500' }}>
                                            {formatTime(log.entryTime)}
                                        </td>

                                        {/* Exit Allowed By (Could be you or another guard) */}
                                        <td className="text-sm text-gray-500">
                                            {log.exitScannedBy ? log.exitScannedBy.name : '-'}
                                        </td>

                                        {/* Exit Time */}
                                        <td style={{ color: '#991b1b', fontWeight: '500' }}>
                                            {formatTime(log.exitTime)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                            No activity found for this date.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SecurityOverview;