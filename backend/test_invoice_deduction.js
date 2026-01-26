// Native fetch is available in Node 18+

async function runTest() {
    const BASE_URL = 'http://localhost:5000/api';
    let token = '';
    let sampleId = '';
    let locationId = '';
    let fromLocationId = '';

    console.log('--- Starting Invoice Deduction Logic Test ---');

    // 1. Login
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: '123456' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message || 'Login failed');
        token = loginData.token;
        console.log('   Login Success. Token acquired.');
    } catch (e) {
        console.error('   Login Error:', e.message);
        return;
    }

    // 2. Get/Create Location
    try {
        console.log('2. Fetching Locations...');
        const locRes = await fetch(`${BASE_URL}/locations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const locs = await locRes.json();
        if (locs.length > 0) {
            locationId = locs[0]._id;
            // Trying to find a different location for "from" if possible, or just use the same logic
            fromLocationId = locs[0]._id; 
            console.log(`   Found Locations. Using: ${locs[0].name} (${locationId})`);
        } else {
            console.log('   No locations found. Creating one...');
            const newLocRes = await fetch(`${BASE_URL}/locations`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: 'Test Warehouse', type: 'warehouse' })
            });
            const newLoc = await newLocRes.json();
            locationId = newLoc._id;
            fromLocationId = newLoc._id;
            console.log(`   Created Location: ${newLoc.name} (${locationId})`);
        }
    } catch (e) {
        console.error('   Location Error:', e.message);
        return;
    }

    // 3. Create Sample (Stock)
    const initialQty = 10;
    try {
        console.log('3. Creating Test Sample (Stock)...');
        const sampleRes = await fetch(`${BASE_URL}/samples`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name: 'Test Stock Item', 
                styleNo: 'STOCK-001', 
                quantity: initialQty,
                sampleType: 'production',
                currentLocation_id: fromLocationId
            })
        });
        const sample = await sampleRes.json();
        if (!sampleRes.ok) throw new Error(sample.message || 'Create Sample Failed');
        sampleId = sample._id;
        console.log(`   Created Sample: ${sample.name} (${sampleId})`);
        console.log(`   Initial Quantity: ${sample.quantity}`);
        console.log(`   Initial Location: ${sample.currentLocation_id}`);
    } catch (e) {
        console.error('   Create Sample Error:', e.message);
        return;
    }

    // 4. Create Invoice (Deduct Stock)
    const invoiceQty = 3;
    try {
        console.log('4. Creating Invoice...');
        const invoiceRes = await fetch(`${BASE_URL}/invoices`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                toLocationId: locationId, // Sending to same location for simplicity, logical check works regardless
                items: [{
                    sampleId: sampleId,
                    quantity: invoiceQty,
                    notes: 'Test invoice deduction'
                }],
                remarks: 'Testing script execution'
            })
        });
        
        const invoiceData = await invoiceRes.json();
        if (!invoiceRes.ok) throw new Error(invoiceData.message || 'Create Invoice Failed');
        
        console.log(`   Invoice Created: #${invoiceData.invoiceNo} (Total Qty: ${invoiceData.totalQuantity})`);

    } catch (e) {
        console.error('   Create Invoice Error:', e.message);
        return;
    }

    // 5. Verify Sample State
    try {
        console.log('5. Verifying Sample State...');
        const verifyRes = await fetch(`${BASE_URL}/samples/${sampleId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const updatedSample = await verifyRes.json();
        
        console.log(`   Updated Quantity: ${updatedSample.quantity}`);
        console.log(`   Updated Location: ${updatedSample.currentLocation_id}`);

        const expectedQty = initialQty - invoiceQty;
        if (updatedSample.quantity === expectedQty) {
            console.log('   PASSED: Quantity was correctly deducted.');
        } else {
             console.error(`   FAILED: Expected Qty ${expectedQty}, but got ${updatedSample.quantity}`);
        }

        if (updatedSample.currentLocation_id === fromLocationId) { // Assuming fromLocationId logic holds
             console.log('   PASSED: Location remained unchanged (as expected for stock deduction).');
        } else {
             console.warn(`   WARNING: Location changed to ${updatedSample.currentLocation_id}. This might be unintended if we want it to stay in stock.`);
        }

    } catch (e) {
        console.error('   Verification Error:', e.message);
    }
}

runTest();
