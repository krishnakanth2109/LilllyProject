import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.user.role);
            localStorage.setItem('userName', res.data.user.name);

            if (res.data.user.role === 'Admin') navigate('/admin-dashboard');
            else if (res.data.user.role === 'Employee') navigate('/employee-dashboard');
            else navigate('/security-dashboard');
        } catch (err) { alert("Login Failed"); }
    };

    return (
        <div className="login-container">
            <form className="login-box" onSubmit={handleLogin}>
                <h1>VPMS Login</h1>
                <p>Enter your credentials to access the portal</p>
                <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};
export default Login;