const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const { verifyAdmin } = require('../middleware/authMiddleware');

// ADMIN ONLY: Register New Employee/Security
router.post('/register-staff', verifyAdmin, async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role // 'Employee' or 'Security'
        });

        await newUser.save();
        res.status(201).json({ message: "Staff account created successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;