import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await authAPI.login({ email, password });
            
            // Store in sessionStorage instead of localStorage
            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('role', res.data.user.role);
            sessionStorage.setItem('userName', res.data.user.name);
            sessionStorage.setItem('userId', res.data.user.id);

            // Navigate based on role
            if (res.data.user.role === 'Admin') {
                navigate('/admin-dashboard');
            } else if (res.data.user.role === 'Employee') {
                navigate('/employee-dashboard');
            } else {
                navigate('/security-dashboard');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || "Login Failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-box" onSubmit={handleLogin}>
                <h1>VPMS Login</h1>
                <p>Enter your credentials to access the portal</p>
                
                {error && (
                    <div className="error-message" style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '15px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    disabled={loading}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;