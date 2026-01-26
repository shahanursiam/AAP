
// Native fetch in Node 18+

async function runTest() {
    const BASE_URL = 'http://localhost:5000/api';
    let token = '';
    let sampleId = '';
    let locationId = '';
    
    console.log('--- Starting Return Sample Test ---');

    try {
        // 1. Login
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: '123456' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error('Login failed');
        token = loginData.token;
        console.log('Login OK');

        // 2. Get Location (Use the first one, e.g. Store Room)
        const locRes = await fetch(`${BASE_URL}/locations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const locs = await locRes.json();
        if (locs.length === 0) throw new Error('No locations found');
        locationId = locs[0]._id;
        console.log('Using Location:', locs[0].name, locationId);

        // 3. Create a Test Sample
        const sampleRes = await fetch(`${BASE_URL}/samples`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name: 'Return Test Item', 
                styleNo: 'RET-001', 
                quantity: 10,
                sampleType: 'proto',
                itemNumber: 'RET-TEST-001'
            })
        });
        const sample = await sampleRes.json();
        sampleId = sample._id;
        console.log('Created Sample ID:', sampleId, 'Initial Qty:', sample.quantity);

        // 4. Perform Return (Add Stock)
        console.log('Performing Return (adding +5)...');
        const returnRes = await fetch(`${BASE_URL}/samples/${sampleId}/return`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                locationId: locationId,
                quantity: 5,
                notes: 'Automated Test Return',
                carton: 'TEST-C1'
            })
        });

        if (!returnRes.ok) {
            const err = await returnRes.json();
            throw new Error(`Return failed: ${err.message}`);
        }

        const returnedSample = await returnRes.json();
        console.log('Return Successful!');
        console.log('Returned Sample ID:', returnedSample._id);
        console.log('New Quantity:', returnedSample.quantity);

        // 5. Verify the quantity increased
        // Note: usage of existing sample or new sample depends on if location matched.
        // If created in step 3 without location, it defaults to something or has no location? 
        // The createSample controller usually assigns a location if provided, or creates it "floating"? 
        // Let's check if the returnedSample ID matches sampleId or is new.
        if (returnedSample._id === sampleId) {
             console.log('Updated existing record.');
             if (returnedSample.quantity === 15) console.log('PASS: Quantity is 15 (10+5)');
             else console.error('FAIL: Quantity mismatch');
        } else {
             console.log('Created new record at destination.');
             if (returnedSample.quantity === 5) console.log('PASS: New record has quantity 5');
             else console.error('FAIL: Quantity mismatch');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

runTest();
