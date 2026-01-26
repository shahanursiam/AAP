const Sample = require('../models/Sample');
const MovementLog = require('../models/MovementLog');
const asyncHandler = require('express-async-handler');

// Helper to generate SKU: SMP-YYMMDD-RAND
const generateSku = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(2);
    const dateStr = `${year}${month}${day}`;
    const random = Math.floor(1000 + Math.random() * 9000); 
    return `SMP-${dateStr}-${random}`;
}

// @desc    Create new sample
// @route   POST /api/samples
// @access  Private
const createSample = asyncHandler(async (req, res) => {
    const { 
        name, styleNo, poNumber, itemNumber, size, color, 
        buyer, season, supplier, vendor, factory, 
        fabricType, fabricDetails, sampleType, quantity, sampleDate, remarks, currentLocation_id 
    } = req.body;

    const sku = generateSku(); 
    
    // Generate sub-barcodes for each item quantity
    let barcodes = [];
    const qty = quantity ? Number(quantity) : 1;
    for(let i=1; i<=qty; i++) {
        barcodes.push(`${sku}-${i}`);
    }

    console.log('Creating sample with data:', req.body);

    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    if (req.user.role !== 'admin' && req.user.role !== 'merchandiser') {
        res.status(403);
        throw new Error('Not authorized to create samples');
    }

    try {
        const sample = await Sample.create({
            sku,
            name,
            styleNo,
            poNumber,
            itemNumber,
            size,
            color,
            buyer,
            season,
            supplier,
            vendor,
            factory,
            fabricType,
            fabricDetails,
            sampleType,
            sampleDate: sampleDate || Date.now(),
            remarks,
            quantity: qty,
            barcodes,
            barcodes,
            status: 'Created',
            currentLocation_id: currentLocation_id || null,
            createdBy: req.user._id
        });

        // Log Creation
        await MovementLog.create({
            sample_id: sample._id,
            action: 'CREATED',
            performedBy: req.user._id,
            comments: 'Sample created'
        });

        res.status(201).json(sample);
    } catch (error) {
        console.error('Error creating sample:', error);
        res.status(500);
        throw new Error('Internal Server Error: ' + error.message);
    }
});

// @desc    Get all samples
// @route   GET /api/samples
// @access  Private
const getSamples = asyncHandler(async (req, res) => {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;

    // Search filter
    const keyword = req.query.keyword ? {
        $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { sku: { $regex: req.query.keyword, $options: 'i' } },
            { styleNo: { $regex: req.query.keyword, $options: 'i' } },
            { buyer: { $regex: req.query.keyword, $options: 'i' } },
        ]
    } : {};

    // Filter for Merchandiser (only their own samples)
    if (req.user.role === 'merchandiser') {
        keyword.createdBy = req.user._id;
    }

    const count = await Sample.countDocuments({ ...keyword });
    const samples = await Sample.find({ ...keyword })
        .populate('currentLocation_id', 'name')
        .populate('createdBy', 'name')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({ samples, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get sample by ID
// @route   GET /api/samples/:id
// @access  Private
const getSampleById = asyncHandler(async (req, res) => {
    const sample = await Sample.findById(req.params.id)
        .populate('currentLocation_id', 'name')
        .populate('createdBy', 'name email');

    if (sample) {
        res.json(sample);
    } else {
        res.status(404);
        throw new Error('Sample not found');
    }
});

// @desc    Get sample by Barcode or SKU
// @route   GET /api/samples/lookup/:barcode
// @access  Private
const getSampleByBarcode = asyncHandler(async (req, res) => {
    const { barcode } = req.params;
    
    // Check if barcode is in barcodes array or is the sku
    // Using FindOne so we get just the first match
    const sample = await Sample.findOne({
        $or: [
            { sku: barcode },
            { barcodes: barcode }
        ]
    }).populate('currentLocation_id');

    if (sample) {
        res.json(sample);
    } else {
        res.status(404);
        throw new Error('Sample not found');
    }
});

// @desc    Update sample
// @route   PUT /api/samples/:id
// @access  Private
const updateSample = asyncHandler(async (req, res) => {
    // Top imports needed: SystemSetting, ApprovalRequest
    const SystemSetting = require('../models/SystemSetting');
    const ApprovalRequest = require('../models/ApprovalRequest');

    const { 
        name, styleNo, poNumber, itemNumber, size, color, 
        buyer, season, supplier, vendor, factory, 
        fabricType, fabricDetails, sampleType, quantity, sampleDate, remarks, status, currentLocation_id
    } = req.body;

    const sample = await Sample.findById(req.params.id);

    if (sample) {
        if (req.user.role !== 'admin' && req.user.role !== 'merchandiser') {
            res.status(403);
            throw new Error('Not authorized to update samples');
        }

        // --- APPROVAL LOGIC START ---
        if (req.user.role === 'merchandiser') {
             // 1. Get Limit
             const setting = await SystemSetting.findOne({ key: 'editWindowMinutes' });
             const limitMinutes = setting ? Number(setting.value) : 120; // Default 120 mins

             // 2. Check Age
             const createdTime = new Date(sample.createdAt).getTime();
             const currentTime = Date.now();
             const diffMinutes = (currentTime - createdTime) / (1000 * 60);

             if (diffMinutes > limitMinutes) {
                 // 3. Create Request
                 await ApprovalRequest.create({
                     merchandiser: req.user._id,
                     sample: sample._id,
                     action: 'UPDATE',
                     data: req.body,
                     status: 'PENDING'
                 });
                 return res.status(202).json({ message: 'Sample is older than edit window. Request sent to Admin for approval.' });
             }
        }
        // --- APPROVAL LOGIC END ---

        sample.name = name || sample.name;
        sample.styleNo = styleNo || sample.styleNo;
        sample.poNumber = poNumber || sample.poNumber;
        sample.itemNumber = itemNumber || sample.itemNumber;
        sample.size = size || sample.size;
        sample.color = color || sample.color;
        sample.buyer = buyer || sample.buyer;
        sample.season = season || sample.season;
        sample.supplier = supplier || sample.supplier;
        sample.vendor = vendor || sample.vendor;
        sample.factory = factory || sample.factory;
        sample.fabricType = fabricType || sample.fabricType;
        sample.fabricDetails = fabricDetails || sample.fabricDetails;
        sample.sampleType = sampleType || sample.sampleType;
        sample.sampleDate = sampleDate || sample.sampleDate;
        sample.remarks = remarks || sample.remarks;
        sample.quantity = quantity || sample.quantity;
        sample.currentLocation_id = currentLocation_id || sample.currentLocation_id;
        
        // Check if status changed to log it
        if (status && status !== sample.status) {
             const oldStatus = sample.status;
             sample.status = status;
             // Log Status Change
            await MovementLog.create({
                sample_id: sample._id,
                action: 'STATUS_CHANGE',
                performedBy: req.user._id,
                comments: `Status changed from ${oldStatus} to ${status}`
            });
        }

        const updatedSample = await sample.save();
        res.json(updatedSample);
    } else {
        res.status(404);
        throw new Error('Sample not found');
    }
});

// @desc    Delete sample
// @route   DELETE /api/samples/:id
// @access  Private
const deleteSample = asyncHandler(async (req, res) => {
    // Top imports needed: SystemSetting, ApprovalRequest
    const SystemSetting = require('../models/SystemSetting');
    const ApprovalRequest = require('../models/ApprovalRequest');

    const sample = await Sample.findById(req.params.id);

    if (sample) {
        if (req.user.role !== 'admin' && req.user.role !== 'merchandiser') {
            res.status(403);
            throw new Error('Not authorized to delete samples');
        }

         // --- APPROVAL LOGIC START ---
         if (req.user.role === 'merchandiser') {
            // 1. Get Limit
            const setting = await SystemSetting.findOne({ key: 'editWindowMinutes' });
            const limitMinutes = setting ? Number(setting.value) : 120; // Default 120 mins

            // 2. Check Age
            const createdTime = new Date(sample.createdAt).getTime();
            const currentTime = Date.now();
            const diffMinutes = (currentTime - createdTime) / (1000 * 60);

            if (diffMinutes > limitMinutes) {
                // 3. Create Request
                await ApprovalRequest.create({
                    merchandiser: req.user._id,
                    sample: sample._id,
                    action: 'DELETE',
                    data: {},
                    status: 'PENDING'
                });
                return res.status(202).json({ message: 'Sample is older than edit window. Request sent to Admin for approval.' });
            }
       }
       // --- APPROVAL LOGIC END ---

        await Sample.deleteOne({ _id: sample._id });
        res.json({ message: 'Sample removed' });
    } else {
        res.status(404);
        throw new Error('Sample not found');
    }
});

// @desc    Get sample history
// @route   GET /api/samples/:id/history
// @access  Private
const getSampleHistory = asyncHandler(async (req, res) => {
    const logs = await MovementLog.find({ sample_id: req.params.id })
        .populate('performedBy', 'name email')
        .sort({ timestamp: -1 });
    res.json(logs);
});

// @desc    Distribute sample (Internal Transfer)
// @route   PUT /api/samples/:id/distribute
// @access  Private
const distributeSample = asyncHandler(async (req, res) => {
    // Top imports needed: Location
    const Location = require('../models/Location');

    const { locationId, notes, quantity, hanger, carton } = req.body; 

    if (!locationId) {
        res.status(400);
        throw new Error('Location is required');
    }

    try {
        const sourceSample = await Sample.findById(req.params.id);

        if (!sourceSample) {
            res.status(404);
            throw new Error('Sample not found');
        }

        // --- VALIDATION LOGIC START ---
        const location = await Location.findById(locationId);
        if (!location) {
             res.status(404);
             throw new Error('Destination location not found in DB');
        }

        const locName = location.name.toLowerCase();
        
        // 1. Allowed Locations Check
        const allowedLocations = ['front desk', 'store room', 'display room', 'general room'];
        const isAllowed = allowedLocations.some(allowed => locName.includes(allowed));
        
        if (!isAllowed) {
             // Optional: Strict check per user request "Movement only to..."
             // If existing locations don't match exactly, this might break things. 
             // Let's assume user will create locations with these names.
             // For safety, warn but maybe dont block if it's a legacy location? 
             // Request said "Movement ONLY to...". So we block.
             res.status(400);
             throw new Error('Invalid location. Allowed: Front Desk, Store Room, Display Room, General Room');
        }

        // 2. Field Requirements
        if (locName.includes('store room')) {
            if (!carton) {
                res.status(400);
                throw new Error('Carton Number is required for Store Room');
            }
        } else if (locName.includes('display room') || locName.includes('general room')) {
            if (!hanger) {
                res.status(400);
                throw new Error('Hanger Number is required for this room');
            }
        }
        // --- VALIDATION LOGIC END ---

        const qtyToMove = quantity ? Number(quantity) : sourceSample.quantity; // Default to all if not specified
        
        if (sourceSample.quantity < qtyToMove) {
             res.status(400);
             throw new Error(`Insufficient stock. Available: ${sourceSample.quantity}`);
        }

        // 1. Deduct from Source
        sourceSample.quantity -= qtyToMove;
        await sourceSample.save();

        // 2. Add to Destination (Find or Create)
        let destSample = await Sample.findOne({
            sku: sourceSample.sku,
            currentLocation_id: locationId,
            hanger: hanger || null,
            carton: carton || null
        });

        if (destSample) {
            destSample.quantity += qtyToMove;
            await destSample.save();
        } else {
             const newSampleData = sourceSample.toObject();
             delete newSampleData._id;
             delete newSampleData.createdAt;
             delete newSampleData.updatedAt;
             delete newSampleData.__v;
             
             destSample = new Sample({
                 ...newSampleData,
                 quantity: qtyToMove,
                 currentLocation_id: locationId,
                 hanger: hanger || null,
                 carton: carton || null,
                 createdBy: req.user._id
             });
             await destSample.save();
        }

        // 3. Log Movement
        await MovementLog.create({
            sample_id: sourceSample._id,
            action: 'INTERNAL_TRANSFER',
            toLocation_id: locationId,
            fromLocation_id: sourceSample.currentLocation_id,
            performedBy: req.user._id,
            quantity: qtyToMove,
            comments: `Moved to ${locationId} (Hanger: ${hanger || '-'}, Carton: ${carton || '-'}) - ${notes || ''}`
        });

        res.json(destSample);

    } catch (error) {
        console.error('Distribute Error:', error);
        res.status(500);
        throw new Error(error.message);
    }
});

module.exports = { createSample, getSamples, getSampleById, getSampleByBarcode, updateSample, deleteSample, getSampleHistory, distributeSample };
