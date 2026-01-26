const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors'); 
const User = require('./models/User');
const Location = require('./models/Location');
const Sample = require('./models/Sample');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Location.deleteMany();
        await Sample.deleteMany();

        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                passwordHash: '123456', // Will be hashed by pre-save hook
                role: 'admin'
            },
            {
                name: 'Jane Merchandiser',
                email: 'user@example.com',
                passwordHash: '123456',
                role: 'merchandiser'
            },
            {
                name: 'Warehouse Keeper',
                email: 'warehouse@example.com',
                passwordHash: '123456',
                role: 'warehouse_staff'
            }
        ]);

        const adminUser = users[0]._id;

        const locations = await Location.create([
            { name: 'Head Office', type: 'office', address: '123 Main St', manager_id: adminUser },
            { name: 'Main Warehouse', type: 'warehouse', address: '456 Storage Ln', manager_id: adminUser },
            { name: 'Display Room', type: 'display', address: '123 Main St, Room 101', manager_id: adminUser },
            { name: 'Vendor A', type: 'vendor', address: 'Dhaka', manager_id: adminUser },
        ]);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Location.deleteMany();
        await Sample.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
