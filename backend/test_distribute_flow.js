// Native fetch is available in Node 18+


async function runTest() {
    const BASE_URL = 'http://localhost:5000/api';
    let token = '';
    let sampleId = '';
    let locationId = '';

    console.log('--- Starting Distribute Flow Test ---');

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

        // 1.5 Test Route
        console.log('1.5 Checking /api/samples/test...');
        const testRes = await fetch(`${BASE_URL}/samples/test`);
        if (testRes.ok) {
             const testText = await testRes.text();
             console.log('   Test Route OK:', testText);
        } else {
             console.error('   Test Route FAILED:', testRes.status);
        }

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
            console.log(`   Found ${locs.length} locations. Using first: ${locs[0].name} (${locationId})`);
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
            console.log(`   Created Location: ${newLoc.name} (${locationId})`);
        }
    } catch (e) {
        console.error('   Location Error:', e.message);
        return;
    }

    // 3. Create Sample
    try {
        console.log('3. Creating Test Sample...');
        const sampleRes = await fetch(`${BASE_URL}/samples`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name: 'Test Distribute Item', 
                styleNo: 'TEST-001', 
                quantity: 10,
                sampleType: 'proto'
            })
        });
        const sample = await sampleRes.json();
        if (!sampleRes.ok) throw new Error(sample.message || 'Create Sample Failed');
        sampleId = sample._id;
        console.log(`   Created Sample: ${sample.name} (${sampleId}) with Quantity: ${sample.quantity}`);
    } catch (e) {
        console.error('   Create Sample Error:', e.message);
        return;
    }

    // 4. Distribute Sample
    try {
        console.log('4. Distributing Sample...');
        const distributeUrl = `${BASE_URL}/samples/${sampleId}/distribute`;
        console.log(`   PUT ${distributeUrl}`);
        
        const distRes = await fetch(distributeUrl, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                locationId: locationId, 
                quantity: 5,
                notes: 'Test distribution via script'
            })
        });

        if (!distRes.ok) {
            const text = await distRes.text();
            console.error('   Distribute Failed Status:', distRes.status);
            console.error('   Distribute Failed Body:', text);
             throw new Error('Distribute Failed: ' + distRes.status);
        }

        const distData = await distRes.json();

        console.log('   Distribute Success!', distData);
        console.log(`   New Location ID: ${distData.currentLocation_id}`);
    } catch (e) {
        console.error('   Distribute Error:', e.message);
    }
}

runTest();
