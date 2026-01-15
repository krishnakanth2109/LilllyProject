import React, { useState, useEffect } from 'react';
import { visitorAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, X, Printer } from 'lucide-react';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
    const [visitors, setVisitors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showQR, setShowQR] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '', 
        mobile: '', 
        email: '', 
        purpose: '', 
        personToVisit: '', 
        visitDate: '', 
        timeIn: ''
    });

    const fetchVisitors = async () => {
        try {
            const res = await visitorAPI.getMyVisitors();
            setVisitors(res.data);
        } catch (err) {
            console.error("Error fetching visitors", err);
            alert("Failed to load visitors. Please try again.");
        }
    };

    useEffect(() => {
        fetchVisitors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await visitorAPI.register(formData);
            setShowModal(false);
            setFormData({ 
                fullName: '', 
                mobile: '', 
                email: '', 
                purpose: '', 
                personToVisit: '', 
                visitDate: '', 
                timeIn: '' 
            });
            fetchVisitors();
        } catch (err) {
            console.error("Registration error:", err);
            alert(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
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

            {/* MODAL: REGISTER VISITOR */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2>Register Visitor</h2>
                            <X className="close-btn" onClick={() => setShowModal(false)} />
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <input 
                                type="text" 
                                placeholder="Visitor Full Name" 
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                                required 
                            />
                            
                            <div className="input-row">
                                <input 
                                    type="text" 
                                    placeholder="Mobile Number" 
                                    value={formData.mobile}
                                    onChange={e => setFormData({...formData, mobile: e.target.value})} 
                                    required 
                                />
                                <input 
                                    type="email" 
                                    placeholder="Email ID" 
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                    required 
                                />
                            </div>

                            <input 
                                type="text" 
                                placeholder="Purpose of Visit (e.g. Meeting)" 
                                value={formData.purpose}
                                onChange={e => setFormData({...formData, purpose: e.target.value})} 
                                required 
                            />
                            
                            <input 
                                type="text" 
                                placeholder="Person to Visit (Host Name)" 
                                value={formData.personToVisit}
                                onChange={e => setFormData({...formData, personToVisit: e.target.value})} 
                                required 
                            />

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Date of Visit</label>
                                    <input 
                                        type="date" 
                                        value={formData.visitDate}
                                        onChange={e => setFormData({...formData, visitDate: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Time In</label>
                                    <input 
                                        type="time" 
                                        value={formData.timeIn}
                                        onChange={e => setFormData({...formData, timeIn: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Generating...' : 'Generate Pass'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: QR CODE DISPLAY */}
            {showQR && (
                <div className="modal-overlay">
                    <div className="modal-card qr-card">
                        <X className="close-btn qr-close" onClick={() => setShowQR(null)} />
                        <div className="pass-brand">VPMS Digital Pass</div>
                        
                        <div className="qr-box">
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