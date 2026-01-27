const mongoose = require('mongoose');
const Sample = require('./models/Sample');
const dotenv = require('dotenv');

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Check what is actually in the DB for one sample
        const sample = await Sample.findOne({});
        console.log('Sample Data:', {
            sku: sample.sku,
            factory: sample.factory,
            supplier: sample.supplier,
            vendor: sample.vendor
        });

        // 2. Simulate the search for "TexPro" (which is the supplier)
        // The user says "Supplier is the factory", so searching "TexPro" in the Factory filter should work.
        const searchTerm = 'TexPro';
        
        const queryOriginal = { factory: { $regex: searchTerm, $options: 'i' } };
        
        const queryMyFix = {
            $or: [
                { factory: { $regex: searchTerm, $options: 'i' } },
                { vendor: { $regex: searchTerm, $options: 'i' } },
                { supplier: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        const countOriginal = await Sample.countDocuments(queryOriginal);
        const countFix = await Sample.countDocuments(queryMyFix);

        console.log(`Searching for "${searchTerm}"...`);
        console.log(`Original Logic (Factory field only): Found ${countOriginal}`);
        console.log(`My Fix (Factory + Vendor + Supplier): Found ${countFix}`);

        // 3. Simulate search for "AAP" (Vendor)
        // User said "Vendor is NOT a factory". So searching "AAP" in Factory filter 
        // ideally SHOULD NOT return results if we are strict, but my fix DOES return it.
        const searchVendor = 'AAP';
        const queryVendorFix = {
             $or: [
                { factory: { $regex: searchVendor, $options: 'i' } },
                { vendor: { $regex: searchVendor, $options: 'i' } },
                { supplier: { $regex: searchVendor, $options: 'i' } }
            ]
        };
        const countVendor = await Sample.countDocuments(queryVendorFix);
        console.log(`Searching for "${searchVendor}" (Vendor)...`);
        console.log(`My Fix (Factory + Vendor + Supplier): Found ${countVendor}`);

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
};

runTest();
