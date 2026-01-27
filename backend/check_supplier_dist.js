const mongoose = require('mongoose');
const Sample = require('./models/Sample');
const dotenv = require('dotenv');

dotenv.config();

const checkDistribution = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const samples = await Sample.find({}, 'supplier');
        
        const counts = {};
        samples.forEach(s => {
            const sup = s.supplier || '(empty)';
            counts[sup] = (counts[sup] || 0) + 1;
        });

        console.log('Supplier Distribution:');
        console.log(JSON.stringify(counts, null, 2));
        console.log(`Total Samples: ${samples.length}`);

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
};

checkDistribution();
