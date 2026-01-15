import React, { useState, useEffect, useCallback, useRef } from 'react';
import { visitorAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, AlertCircle, RefreshCw, UploadCloud, QrCode } from 'lucide-react';
import './SecurityDashboard.css';

const SecurityDashboard = () => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showTestMode, setShowTestMode] = useState(false);
    const [testId, setTestId] = useState("VPMS-1001");

    const scannerRef = useRef(null);
    const apiLock = useRef(false);

    // API LOGIC
    const handleScanApi = useCallback(async (visitorId) => {
        if (!visitorId || apiLock.current) return;
        
        const token = sessionStorage.getItem('token');
        if (!token) {
            setError("Authentication failed. Please login again.");
            return;
        }

        apiLock.current = true;
        setIsProcessing(true);
        setError(null);

        try {
            console.log("📡 Requesting Server for ID:", visitorId);
            
            const res = await visitorAPI.scanVisitor(visitorId);
            setScanResult(res.data.message);
        } catch (err) {
            console.error("❌ API Error:", err);
            setError(err.response?.data?.message || "Error communicating with Server.");
        } finally {
            setIsProcessing(false);
            apiLock.current = false;
        }
    }, []);

    // SCANNER MANAGEMENT
    const killScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
            } catch (err) {
                console.warn("Stop scanner failed:", err);
            }
            scannerRef.current = null;
        }
        const container = document.getElementById("reader");
        if (container) container.innerHTML = "";
    };

    const startScanner = async () => {
        await killScanner();

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        try {
            await html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    console.log("✅ Scan Success:", decodedText);
                    killScanner();
                    handleScanApi(decodedText.trim());
                },
                (err) => { /* Ignore constant scan failures */ }
            );
        } catch (err) {
            console.error("Camera start failed:", err);
            setError("Camera failed to start. Check permissions.");
        }
    };

    useEffect(() => {
        if (!showTestMode && !scanResult && !error && !isProcessing) {
            const timer = setTimeout(() => startScanner(), 200);
            return () => {
                clearTimeout(timer);
                killScanner();
            };
        } else {
            killScanner();
        }
        return () => { killScanner(); };
    }, [showTestMode, scanResult, error, isProcessing]);

    const handleReset = () => {
        setScanResult(null);
        setError(null);
        setIsProcessing(false);
        apiLock.current = false;
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content">
                <Navbar />
                <div className="dashboard-body">
                    <div className="security-card">
                        <h1 className="title">Gate Security Scanner</h1>
                        
                        <div className="security-tabs">
                            <button 
                                className={`tab-button ${!showTestMode ? 'active' : ''}`}
                                onClick={() => { setShowTestMode(false); handleReset(); }}
                                disabled={isProcessing}
                            >
                                <QrCode size={20} /> Live Camera Scan
                            </button>
                            <button 
                                className={`tab-button ${showTestMode ? 'active' : ''}`}
                                onClick={() => { setShowTestMode(true); handleReset(); }}
                                disabled={isProcessing}
                            >
                                <UploadCloud size={20} /> Manual Test Mode
                            </button>
                        </div>

                        <div className="display-area">
                            {/* LOADING STATE */}
                            {isProcessing && (
                                <div className="status-overlay">
                                    <RefreshCw className="spin-icon" size={48} />
                                    <p>Processing Visitor Pass...</p>
                                </div>
                            )}

                            {/* SUCCESS STATE */}
                            {!isProcessing && scanResult && (
                                <div className="result-box success">
                                    <CheckCircle size={48} color="#16a34a" />
                                    <h2>SUCCESS!</h2>
                                    <p>{scanResult}</p>
                                    <button className="reset-btn" onClick={handleReset}>
                                        <RefreshCw size={18} /> Scan Next Visitor
                                    </button>
                                </div>
                            )}

                            {/* ERROR STATE */}
                            {!isProcessing && error && (
                                <div className="result-box failure">
                                    <AlertCircle size={48} color="#dc2626" />
                                    <h2>Scan Failed</h2>
                                    <p>{error}</p>
                                    <button className="reset-btn" onClick={handleReset}>
                                        <RefreshCw size={18} /> Try Again
                                    </button>
                                </div>
                            )}

                            {/* LIVE SCANNER VIEW */}
                            {!isProcessing && !scanResult && !error && !showTestMode && (
                                <>
                                    <p className="scanner-instruction">Point the camera at the visitor's QR code.</p>
                                    <div className="scanner-window">
                                        <div id="reader"></div>
                                    </div>
                                </>
                            )}

                            {/* MANUAL TEST MODE */}
                            {!isProcessing && !scanResult && !error && showTestMode && (
                                <div className="test-mode-card">
                                    <p className="scanner-instruction">Enter a known Visitor ID and click Test Logic.</p>
                                    <form onSubmit={(e) => { e.preventDefault(); handleScanApi(testId); }}>
                                        <input 
                                            type="text" 
                                            value={testId} 
                                            onChange={(e) => setTestId(e.target.value.toUpperCase())}
                                            placeholder="Enter ID (e.g., VPMS-1001)"
                                            required
                                        />
                                        <button type="submit" className="btn-test-logic">
                                            Test Scan Logic
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboard;