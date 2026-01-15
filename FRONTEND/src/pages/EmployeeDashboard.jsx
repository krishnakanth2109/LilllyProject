import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { QRCodeCanvas } from 'qrcode.react'; // Ensure you ran: npm install qrcode.react
import { QrCode, X, Printer } from 'lucide-react';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
    const [visitors, setVisitors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showQR, setShowQR] = useState(null); // Stores the selected visitor object
    const [formData, setFormData] = useState({
        fullName: '', mobile: '', email: '', purpose: '', personToVisit: '', visitDate: '', timeIn: ''
    });

    // 1. Fetch Visitors from DB
    const fetchVisitors = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('http://localhost:5001/api/visitors/my-visitors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVisitors(res.data);
        } catch (err) {
            console.error("Error fetching visitors", err);
        }
    };

    useEffect(() => {
        fetchVisitors();
    }, []);

    // 2. Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5001/api/visitors/register', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false); // Close register popup
            // Reset form
            setFormData({ fullName: '', mobile: '', email: '', purpose: '', personToVisit: '', visitDate: '', timeIn: '' });
            fetchVisitors(); // Refresh list
        } catch (err) {
            alert("Registration failed. Please check backend.");
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content">
                <Navbar />
                <div className="dashboard-body">
                    <div className="header-flex">
                        <h1>My Visitors</h1>
                        <button className="btn-add" onClick={() => setShowModal(true)}>
                            + Register Visitor
                        </button>
                    </div>

                    <div className="table-wrapper">
                        {visitors.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Visitor ID</th>
                                        <th>Full Name</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visitors.map((v) => (
                                        <tr key={v._id}>
                                            <td className="fw-bold">{v.visitorId}</td>
                                            <td>{v.fullName}</td>
                                            <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${v.status.toLowerCase()}`}>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="view-qr-btn" onClick={() => setShowQR(v)}>
                                                    <QrCode size={16} /> View Pass
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="no-data">No visitors registered yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODAL: REGISTER VISITOR --- */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2>Register Visitor</h2>
                            <X className="close-btn" onClick={() => setShowModal(false)} />
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <input type="text" placeholder="Visitor Full Name" required
                                onChange={e => setFormData({...formData, fullName: e.target.value})} />
                            
                            <div className="input-row">
                                <input type="text" placeholder="Mobile Number" required
                                    onChange={e => setFormData({...formData, mobile: e.target.value})} />
                                <input type="email" placeholder="Email ID" required
                                    onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>

                            <input type="text" placeholder="Purpose of Visit (e.g. Meeting)" required
                                onChange={e => setFormData({...formData, purpose: e.target.value})} />
                            
                            <input type="text" placeholder="Person to Visit (Host Name)" required
                                onChange={e => setFormData({...formData, personToVisit: e.target.value})} />

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Date of Visit</label>
                                    <input type="date" required onChange={e => setFormData({...formData, visitDate: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Time In</label>
                                    <input type="time" required onChange={e => setFormData({...formData, timeIn: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="submit-btn">Generate Pass</button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: QR CODE DISPLAY --- */}
            {showQR && (
                <div className="modal-overlay">
                    <div className="modal-card qr-card">
                        <X className="close-btn qr-close" onClick={() => setShowQR(null)} />
                        <div className="pass-brand">VPMS Digital Pass</div>
                        
                        <div className="qr-box">
                            {/* The value is the unique Visitor ID which Security will scan */}
                            <QRCodeCanvas value={showQR.visitorId} size={180} />
                        </div>

                        <div className="pass-details">
                            <h3>{showQR.fullName}</h3>
                            <p className="pass-id">ID: {showQR.visitorId}</p>
                            <hr />
                            <div className="pass-grid">
                                <div><strong>Date:</strong> {new Date(showQR.visitDate).toLocaleDateString()}</div>
                                <div><strong>Host:</strong> {showQR.personToVisit}</div>
                            </div>
                        </div>

                        <button className="print-btn" onClick={() => window.print()}>
                            <Printer size={18} /> Print Pass
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;