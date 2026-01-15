const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    visitorId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    purpose: { type: String, required: true },
    personToVisit: { type: String, required: true },
    visitDate: { type: Date, required: true },
    
    // This was the 'expected' time from registration
    timeIn: { type: String, required: true }, 
    
    // --- NEW FIELDS: ACTUAL SCAN TIMES ---
    entryTime: { type: Date }, 
    exitTime: { type: Date },

    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Checked-In', 'Checked-Out'], default: 'Pending' },
    entryScannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    exitScannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);