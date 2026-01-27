const mongoose = require('mongoose');
const Sample = require('./models/Sample');
const dotenv = require('dotenv');

dotenv.config();

const verifyStrictFilter = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Setup the Filter Logic identically to the Controller
        const createFactoryFilter = (term) => ({
            $or: [
                { factory: { $regex: term, $options: 'i' } },
                { supplier: { $regex: term, $options: 'i' } }
                // Vendor is EXCLUDED now
            ]
        });

        // 2. Test Case A: "TexPro" (Known Supplier)
        // This SHOULD return results
        const supplierTerm = 'TexPro';
        const supplierQuery = createFactoryFilter(supplierTerm);
        const supplierCount = await Sample.countDocuments(supplierQuery);
        console.log(`[TEST] Searching Factory Filter for "${supplierTerm}" (Supplier)...`);
        console.log(`Result: Found ${supplierCount} samples. ${supplierCount > 0 ? '✅ PASS' : '❌ FAIL'}`);

        // 3. Test Case B: "AAP" (Known Vendor)
        // This SHOULD RETURN ZERO results (if we are strict)
        const vendorTerm = 'AAP';
        const vendorQuery = createFactoryFilter(vendorTerm);
        const vendorCount = await Sample.countDocuments(vendorQuery);
        console.log(`[TEST] Searching Factory Filter for "${vendorTerm}" (Vendor)...`);
        console.log(`Result: Found ${vendorCount} samples. ${vendorCount === 0 ? '✅ PASS' : '❌ FAIL (Should be 0)'}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

verifyStrictFilter();
