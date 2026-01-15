const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const jwt = require('jsonwebtoken');
const { verifyAdmin } = require('../middleware/authMiddleware'); 

// --- MIDDLEWARE: VERIFY TOKEN ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        req.userId = decoded.id; // Saves the logged-in user's ID
        next();
    });
};

// --- 1. REGISTER VISITOR ---
router.post('/register', verifyToken, async (req, res) => {
    try {
        const count = await Visitor.countDocuments();
        const visitorId = `VPMS-${1000 + count + 1}`;

        const newVisitor = new Visitor({
            ...req.body,
            visitorId,
            host: req.userId
        });

        await newVisitor.save();
        res.status(201).json(newVisitor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. GET MY VISITORS ---
router.get('/my-visitors', verifyToken, async (req, res) => {
    try {
        const visitors = await Visitor.find({ host: req.userId }).sort({ createdAt: -1 });
        res.json(visitors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. SCAN QR CODE (UPDATED to save Security Name) ---
// Note: We added 'verifyToken' here so we know WHO is scanning
// ... imports and other routes ...

// --- 3. SCAN QR CODE (Updated with Time Capture) ---
router.put('/scan/:visitorId', verifyToken, async (req, res) => {
    const visitorId = req.params.visitorId.trim();
    console.log("🔍 SCAN ATTEMPT BY:", req.userId, "FOR:", visitorId);

    try {
        const visitor = await Visitor.findOne({ 
            visitorId: { $regex: new RegExp(`^${visitorId}$`, "i") } 
        });

        if (!visitor) return res.status(404).json({ message: `Visitor ${visitorId} not found.` });

        let newStatus = "";
        let message = "";

        if (visitor.status === 'Pending') {
            newStatus = 'Checked-In';
            message = `Welcome ${visitor.fullName}! Checked-In.`;
            
            visitor.entryScannedBy = req.userId;
            visitor.entryTime = new Date(); // <--- CAPTURE ENTRY TIME

        } else if (visitor.status === 'Checked-In') {
            newStatus = 'Checked-Out';
            message = `Goodbye ${visitor.fullName}! Checked-Out.`;
            
            visitor.exitScannedBy = req.userId;
            visitor.exitTime = new Date(); // <--- CAPTURE EXIT TIME

        } else {
            return res.status(400).json({ message: "Already checked out." });
        }

        visitor.status = newStatus;
        await visitor.save();
        res.json({ message, visitor });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ... rest of the file ...

// --- 4. ADMIN LOGS (UPDATED to fetch Security Names) ---
router.get('/admin-logs', verifyAdmin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalVisitors = await Visitor.countDocuments({});
        const todayVisitors = await Visitor.countDocuments({ createdAt: { $gte: today } });
        const activeVisitors = await Visitor.countDocuments({ status: 'Checked-In' });
        
        // POPULATE ALL RELATIONSHIPS
        const allLogs = await Visitor.find({})
            .populate('host', 'name')           // Get Host Name
            .populate('entryScannedBy', 'name') // Get Security Name (Entry)
            .populate('exitScannedBy', 'name')  // Get Security Name (Exit)
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            totalVisitors,
            todayVisitors,
            activeVisitors,
            logs: allLogs
        });

    } catch (err) {
        console.error("Admin Log Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 5. SECURITY OVERVIEW (Stats for Logged-in Security) ---
router.get('/security-stats', verifyToken, async (req, res) => {
    try {
        const { date } = req.query;
        const queryDate = date ? new Date(date) : new Date();
        
        // Set start and end of the selected day
        const startOfDay = new Date(queryDate); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(queryDate); endOfDay.setHours(23, 59, 59, 999);

        // Find logs where THIS security user performed Entry OR Exit scan on THIS date
        // Note: We check entryTime/exitTime to ensure the action happened on the selected date
        const logs = await Visitor.find({
            $or: [
                { 
                    entryScannedBy: req.userId, 
                    entryTime: { $gte: startOfDay, $lte: endOfDay } 
                },
                { 
                    exitScannedBy: req.userId, 
                    exitTime: { $gte: startOfDay, $lte: endOfDay } 
                }
            ]
        })
        .populate('host', 'name')
        .populate('exitScannedBy', 'name') // We need this for the table column
        .sort({ updatedAt: -1 });

        // Calculate Stats for this specific guard on this specific date
        let entriesAllowed = 0;
        let exitsAllowed = 0;

        logs.forEach(log => {
            // Check if THIS user did the entry scan
            if (log.entryScannedBy && log.entryScannedBy.toString() === req.userId && 
                new Date(log.entryTime) >= startOfDay && new Date(log.entryTime) <= endOfDay) {
                entriesAllowed++;
            }
            // Check if THIS user did the exit scan
            if (log.exitScannedBy && log.exitScannedBy.toString() === req.userId && 
                new Date(log.exitTime) >= startOfDay && new Date(log.exitTime) <= endOfDay) {
                exitsAllowed++;
            }
        });

        res.json({
            totalActions: entriesAllowed + exitsAllowed,
            entriesAllowed,
            exitsAllowed,
            logs
        });

    } catch (err) {
        console.error("Security Stats Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 6. EMPLOYEE OVERVIEW (Stats for Logged-in Employee) ---
router.get('/employee-stats', verifyToken, async (req, res) => {
    try {
        const { date } = req.query;
        const queryDate = date ? new Date(date) : new Date();
        
        // Filter by the Scheduled Visit Date
        const startOfDay = new Date(queryDate); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(queryDate); endOfDay.setHours(23, 59, 59, 999);

        // Find visitors invited by THIS user for THIS date
        const logs = await Visitor.find({
            host: req.userId,
            visitDate: { $gte: startOfDay, $lte: endOfDay }
        })
        .populate('entryScannedBy', 'name') // Get Security Name (Entry)
        .populate('exitScannedBy', 'name')  // Get Security Name (Exit)
        .populate('host', 'name')           // Get Host Name (Self)
        .sort({ visitDate: 1 }); // Sort by time

        // Calculate Stats
        const totalScheduled = logs.length;
        // Visitors who have arrived (Checked-In or Checked-Out)
        const arrived = logs.filter(l => l.status !== 'Pending').length;
        const pending = logs.filter(l => l.status === 'Pending').length;

        res.json({
            totalScheduled,
            arrived,
            pending,
            logs
        });

    } catch (err) {
        console.error("Employee Stats Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;