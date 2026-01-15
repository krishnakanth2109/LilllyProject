const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// DEBUGGER: This will print every request to your terminal
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/visitors', require('./routes/visitor')); 


// IMPORTANT: Check if the file name matches exactly './routes/visitor'
try {
    app.use('/api/visitors', require('./routes/visitor'));
    console.log("✅ Visitor routes loaded successfully");
} catch (err) {
    console.log("❌ Failed to load visitor routes. Check if routes/visitor.js exists.");
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Error:", err));

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));