import React, { useState, useEffect } from 'react';
import { visitorAPI } from '../utils/api';
import Layout from '../components/Layout';
import './AdminDashboard.css';

const EmployeeOverview = () => {
    const getTodayString = () => new Date().toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [stats, setStats] = useState({ totalScheduled: 0, arrived: 0, pending: 0 });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await visitorAPI.getEmployeeStats(selectedDate);
            setStats(res.data);
            setLogs(res.data.logs || []);
        } catch (err) {
            console.error("Employee stats error:", err);
            setError(err.response?.data?.message || "Failed to load visitor history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

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
        <Layout title="Visitor Overview">
            
            {/* DATE FILTER */}
            <div className="filter-section" style={{ 
                marginBottom: '20px', 
                background: 'white', 
                padding: '15px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
            }}>
                <label style={{ fontWeight: 'bold', color: '#475569' }}>Filter Date:</label>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
                <button 
                    onClick={() => setSelectedDate(getTodayString())}
                    style={{ 
                        padding: '8px 15px', 
                        background: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer' 
                    }}
                >
                    Today
                </button>
            </div>

            {/* STATS CARDS */}
            <div className="stats-grid">
                <div className="admin-stat-card" style={{ borderLeftColor: '#2563eb' }}>
                    <h4>Scheduled for Date</h4>
                    <p>{stats.totalScheduled}</p>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: '#10b981' }}>
                    <h4>Arrived / Completed</h4>
                    <p>{stats.arrived}</p>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: '#f97316' }}>
                    <h4>Still Pending</h4>
                    <p>{stats.pending}</p>
                </div>
            </div>

            {/* LOGS TABLE */}
            <div className="table-section">
                <h3>Scheduled Visitors ({selectedDate})</h3>
                {loading ? (
                    <p>Loading records...</p>
                ) : error ? (
                    <p style={{ color: '#dc2626', padding: '20px' }}>{error}</p>
                ) : (
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
                                {logs.length > 0 ? logs.map(log => (
                                    <tr key={log._id}>
                                        <td style={{ fontWeight: 'bold' }}>{log.visitorId}</td>
                                        <td>{log.fullName}</td>
                                        <td>
                                            <span className={`status ${getStatusClass(log.status)}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td>{log.host ? log.host.name : 'Me'}</td>
                                        <td className="text-sm text-gray-500">
                                            {log.entryScannedBy ? log.entryScannedBy.name : '-'}
                                        </td>
                                        <td style={{ color: '#166534', fontWeight: '500' }}>
                                            {formatTime(log.entryTime)}
                                        </td>
                                        <td className="text-sm text-gray-500">
                                            {log.exitScannedBy ? log.exitScannedBy.name : '-'}
                                        </td>
                                        <td style={{ color: '#991b1b', fontWeight: '500' }}>
                                            {formatTime(log.exitTime)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                                            No visitors scheduled for this date.
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

export default EmployeeOverview;