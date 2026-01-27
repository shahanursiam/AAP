const mongoose = require('mongoose');
const Sample = require('./models/Sample');
const Container = require('./models/Container');
const User = require('./models/User'); // Need User to assign createdBy
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        console.log("Starting Migration...");
        
        // Find samples with legacy carton data
        const samples = await Sample.find({ 
            carton: { $exists: true, $ne: '' }
        });
        
        console.log(`Found ${samples.length} samples to migrate.`);
        const cartonMap = {}; // cartonId -> [sampleIds]
        
        // Group by carton ID
        samples.forEach(s => {
            if (!s.carton) return;
            if (s.container) return; // Already migrated
            if (!cartonMap[s.carton]) cartonMap[s.carton] = [];
            cartonMap[s.carton].push(s);
        });

        // Get a default user (admin) for createdBy
        const adminUser = await User.findOne({ role: 'admin' });
        const userId = adminUser ? adminUser._id : null;

        for (const [cartonId, sampleList] of Object.entries(cartonMap)) {
            console.log(`Processing Carton ID: ${cartonId} with ${sampleList.length} items`);
            
            // Check if Container exists
            let container = await Container.findOne({ containerId: cartonId });
            
            if (!container) {
                console.log(`Creating new Container for ${cartonId}...`);
                container = await Container.create({
                    containerId: cartonId,
                    type: 'Carton',
                    status: 'Active',
                    createdBy: userId,
                    items: []
                });
            }

            // Update Samples and Container items
            for (const sample of sampleList) {
                console.log(`Linking sample ${sample.sku} to container ${container.containerId}`);
                sample.container = container._id;
                await sample.save();

                // Add to container items if not already there
                if (!container.items.includes(sample._id)) {
                    container.items.push(sample._id);
                }
            }
            await container.save();
        }
        
        console.log("Migration Complete.");

    } catch(e) { console.error(e); }
    process.exit();
});
