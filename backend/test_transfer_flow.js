// Native fetch is available in Node 18+

async function runTest() {
    const BASE_URL = 'http://localhost:5000/api';
    let token = '';
    let sourceSampleId = '';
    let toLocationId = '';

    console.log('--- Starting Stock Transfer & Storage Test ---');

    // 1. Login
    try {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: '123456' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message);
        token = loginData.token;
        console.log('1. Login Success.');
    } catch (e) {
        return console.error('Login Error:', e.message);
    }

    // 2. Setup Locations
    try {
        // Create specific "Display Room" for testing
        const newLocRes = await fetch(`${BASE_URL}/locations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name: 'Display Room Test ' + Date.now(), type: 'office' }) // Valid type found in model
        });
        const newLoc = await newLocRes.json();
        if (!newLocRes.ok) throw new Error('Create Location Failed: ' + newLoc.message);
        
        toLocationId = newLoc._id;
        console.log(`2. Created Dest Location: ${newLoc.name} (${toLocationId})`);
    } catch (e) {
        return console.error('Location Error:', e.message);
    }

    // 3. Create Source Stock
    try {
        const sampleRes = await fetch(`${BASE_URL}/samples`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                name: 'Transfer Item', 
                styleNo: 'TRANS-001-' + Date.now(), // Unique Style
                quantity: 10,
                sampleType: 'production'
            })
        });
        const sample = await sampleRes.json();
        sourceSampleId = sample._id;
        console.log(`3. Created Source Stock: ${sample.name} (Qty: 10)`);
    } catch (e) {
        return console.error('Create Sample Error:', e.message);
    }

    // 4. Transfer 1: Move 3 items to Hanger "H-101"
    try {
        console.log(`4. Transferring 3 items to Hanger H-101... (LocID: ${toLocationId})`);
        const distributeRes = await fetch(`${BASE_URL}/samples/${sourceSampleId}/distribute`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                locationId: toLocationId,
                quantity: 3,
                hanger: 'H-101',
                carton: 'C-001',
                notes: 'First Transfer'
            })
        });
        if (!distributeRes.ok) throw new Error((await distributeRes.json()).message);
        console.log('   Transfer 1 Success.');
    } catch (e) {
        return console.error('Transfer 1 Error:', e.message);
    }

    // 5. Verify Transfer 1
    let destSampleId = '';
    try {
        // Check Source Qty
        const sourceRes = await fetch(`${BASE_URL}/samples/${sourceSampleId}`, { headers: { 'Authorization': `Bearer ${token}` }});
        const source = await sourceRes.json();
        console.log(`   Source Qty: ${source.quantity} (Expected: 7)`);

        // Find Destination Sample
        const listRes = await fetch(`${BASE_URL}/samples?keyword=${source.styleNo}`, { headers: { 'Authorization': `Bearer ${token}` }});
        const list = await listRes.json();
        const destSample = list.samples.find(s => s.currentLocation_id === toLocationId && s.hanger === 'H-101');
        
        if (destSample) {
            console.log(`   Dest Sample Found: Qty ${destSample.quantity} (Expected: 3), Hanger: ${destSample.hanger}`);
            destSampleId = destSample._id;
        } else {
            console.error('   FAILED: Destination Sample not found!');
        }
    } catch (e) {
        return console.error('Verify 1 Error:', e.message);
    }

    // 6. Transfer 2: Move 2 MORE items to SAME Hanger "H-101"
    try {
        console.log('6. Transferring 2 more items to Hanger H-101 (Should Merge)...');
        const distributeRes = await fetch(`${BASE_URL}/samples/${sourceSampleId}/distribute`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                locationId: toLocationId,
                quantity: 2,
                hanger: 'H-101',
                carton: 'C-001',
                notes: 'Second Transfer'
            })
        });
        if (!distributeRes.ok) throw new Error((await distributeRes.json()).message);
        console.log('   Transfer 2 Success.');
    } catch (e) {
        return console.error('Transfer 2 Error:', e.message);
    }

    // 7. Verify Transfer 2 (Merge)
    try {
        // Check Source Qty
        const sourceRes = await fetch(`${BASE_URL}/samples/${sourceSampleId}`, { headers: { 'Authorization': `Bearer ${token}` }});
        const source = await sourceRes.json();
        console.log(`   Source Qty: ${source.quantity} (Expected: 5)`);

        // Check Dest Qty
        const destRes = await fetch(`${BASE_URL}/samples/${destSampleId}`, { headers: { 'Authorization': `Bearer ${token}` }});
        const dest = await destRes.json();
        console.log(`   Dest Sample Qty: ${dest.quantity} (Expected: 5 [3+2])`);
        
        if (dest.quantity === 5) console.log('   PASSED: Merge Success');
        else console.error('   FAILED: Merge Failed');

    } catch (e) {
         return console.error('Verify 2 Error:', e.message);
    }
}

runTest();
