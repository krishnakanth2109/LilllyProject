const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const empPassword = await bcrypt.hash('emp123', salt);
    const secPassword = await bcrypt.hash('sec123', salt);

    const users = [
        { name: 'System Admin', email: 'admin@test.com', password: adminPassword, role: 'Admin' },
        { name: 'John Employee', email: 'emp@test.com', password: empPassword, role: 'Employee' },
        { name: 'Gate Security', email: 'sec@test.com', password: secPassword, role: 'Security' },
    ];

    await User.deleteMany(); // Clears existing users
    await User.insertMany(users);
    console.log("3 Users created: admin@test.com, emp@test.com, sec@test.com");
    process.exit();
};

seedUsers();