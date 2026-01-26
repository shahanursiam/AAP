
// Native fetch in Node 18+

async function runTest() {
    const BASE_URL = 'http://localhost:5000/api';
    let token = '';
    let sampleId = '';
    let locationId = '';

    console.log('--- Starting Invoice Test ---');

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

        // 2. Get Location
        const locRes = await fetch(`${BASE_URL}/locations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const locs = await locRes.json();
        locationId = locs[0]._id;
        console.log('Location ID:', locationId);

        // 3. Create Sample
        const sampleRes = await fetch(`${BASE_URL}/samples`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name: 'Inv Test Item', 
                styleNo: 'INV-999', 
                quantity: 100,
                sampleType: 'proto'
            })
        });
        const sample = await sampleRes.json();
        sampleId = sample._id;
        console.log('Sample ID:', sampleId);

        // 4. Create Invoice
        console.log('Creating Invoice...');
        const invRes = await fetch(`${BASE_URL}/invoices`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                toLocationId: locationId,
                remarks: 'Test Invoice',
                items: [
                    { sampleId: sampleId, quantity: 5, notes: 'Test Note' }
                ]
            })
        });

        if (!invRes.ok) {
            const err = await invRes.json();
            console.error('Invoice Error:', JSON.stringify(err, null, 2));
        } else {
            console.log('Invoice Created!');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

runTest();
