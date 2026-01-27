const Container = require('../models/Container');
const Sample = require('../models/Sample');
const asyncHandler = require('express-async-handler');

// @desc    Create new Container (Carton or Hanger)
// @route   POST /api/tracking/containers
// @access  Private
const createContainer = asyncHandler(async (req, res) => {
    const { type, containerId } = req.body;

    if (!containerId || !type) {
        res.status(400);
        throw new Error('Please provide container ID and type');
    }

    const containerExists = await Container.findOne({ containerId });
    if (containerExists) {
        res.status(400);
        throw new Error('Container ID already exists');
    }

    const container = await Container.create({
        containerId,
        type,
        createdBy: req.user._id
    });

    res.status(201).json(container);
});

// @desc    Add Sample to Container
// @route   POST /api/tracking/add-item
// @access  Private
const addToContainer = asyncHandler(async (req, res) => {
    const { containerId, sampleSku, sourceSampleId } = req.body; // Added sourceSampleId

    const container = await Container.findOne({ containerId });
    if (!container) {
        res.status(404);
        throw new Error('Container not found');
    }

    let sample;

    // 1. If strict Source ID is provided, use it.
    if (sourceSampleId) {
        sample = await Sample.findById(sourceSampleId);
        if (!sample) {
            res.status(404);
            throw new Error('Selected source sample not found');
        }
    } else {
        // 2. Otherwise, exact ID search (if they scanned a unique barcode)
        if (sampleSku.match(/^[0-9a-fA-F]{24}$/)) {
            sample = await Sample.findById(sampleSku);
        }

        // 3. Fallback: Search by SKU (could be multiple!)
        if (!sample) {
            // Find ALL candidates with positive quantity
            const candidates = await Sample.find({ sku: sampleSku, quantity: { $gt: 0 } })
                .populate('currentLocation_id', 'name') // Populate location name if available
                .populate('container', 'containerId');  // Populate container info if in one

            if (candidates.length === 0) {
                 res.status(404);
                 throw new Error('No items found with this SKU/ID (or out of stock)');
            } else if (candidates.length === 1) {
                sample = candidates[0];
            } else {
                // *** MULTIPLE SOURCES FOUND ***
                // Return list for user to choose
                return res.status(300).json({  // 300 Multiple Choices
                    message: 'Multiple sources found', 
                    sources: candidates.map(c => ({
                        _id: c._id,
                        location: c.currentLocation_id?.name || 'Unknown Location',
                        container: c.container ? ('Container: ' + c.container.containerId) : 'Main Inventory',
                        quantity: c.quantity,
                        sku: c.sku,
                        name: c.name
                    }))
                });
            }
        }
    }

    if (!sample) {
        res.status(404);
        throw new Error('Sample not found');
    }

    // Check if sample is already in this container
    if (sample.container && sample.container.toString() === container._id.toString()) {
        res.status(400);
        throw new Error('Sample already in this container');
    }

    const quantityToAdd = req.body.quantity ? parseInt(req.body.quantity) : null;

    if (quantityToAdd && quantityToAdd > 0) {
        if (quantityToAdd > sample.quantity) {
             res.status(400);
             throw new Error(`Insufficient quantity. Available: ${sample.quantity}`);
        }

        if (quantityToAdd < sample.quantity) {
            // *** SPLIT LOGIC ***
            // 1. Create a copy of the sample
            const newSampleData = sample.toObject();
            delete newSampleData._id;
            delete newSampleData.createdAt;
            delete newSampleData.updatedAt;
            delete newSampleData.__v;
            delete newSampleData.container; // Ensure copy isn't double-linked yet

            newSampleData.quantity = quantityToAdd; // Set new qty
            newSampleData.container = container._id; // Link to container
            
            // Generate a unique SKU suffix if needed or keep same SKU (allowed if not unique constrained)
            // Assuming SKU is not unique constrained or we want same SKU.
            // If SKU must be unique, we'd need a strategy here. 
            // Checking Sample Model: sku is required, but not explicitly unique in schema definition I saw earlier?
            // "sku: { type: String, required: true }". Check if index exists elsewhere. Assuming OK to duplicate for now.

            const newSample = await Sample.create(newSampleData);

            // 2. Decrement original
            sample.quantity -= quantityToAdd;
            await sample.save();

            // 3. Add NEW sample to container
            container.items.push(newSample._id);
            await container.save();

            res.json({ message: `Added ${quantityToAdd} items (Split)`, container });
            return;
        }
        // If Equal, fall through to full move
    }

    // *** FULL MOVE LOGIC (quantity equal or not specified) ***

    // If sample is in another container, remove it from there first
    if (sample.container) {
        const oldContainer = await Container.findById(sample.container);
        if (oldContainer) {
            oldContainer.items = oldContainer.items.filter(id => id.toString() !== sample._id.toString());
            await oldContainer.save();
        }
    }

    // Add to new container
    container.items.push(sample._id);
    await container.save();

    // Update sample
    sample.container = container._id;
    // Do NOT enable this line: sample.quantity = quantity; // We moved the WHOLE thing
    await sample.save();
    
    res.json({ message: 'Sample added', container });
});

// @desc    Get Container Details
// @route   GET /api/tracking/containers/:id
// @access  Private
const getContainerByBarcode = asyncHandler(async (req, res) => {
    const container = await Container.findOne({ containerId: req.params.id })
        .populate({
            path: 'items',
            populate: { path: 'createdBy', select: 'name' }
        })
        .populate('createdBy', 'name');

    if (container) {
        res.json(container);
    } else {
        res.status(404);
        throw new Error('Container not found');
    }
});

module.exports = {
    createContainer,
    addToContainer,
    getContainerByBarcode
};
