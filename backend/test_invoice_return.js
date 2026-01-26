// Native fetch in Node 18+
const fs = require('fs');

async function runTest() {
    const BASE_URL = 'http://localhost:5000/api';
    let token = '';
    let sampleId = '';
    let locationId = '';
    let invoiceNo = '';
    let logBuffer = '';

    const log = (msg) => {
        console.log(msg);
        logBuffer += msg + '\n';
    };

    log('--- Starting Invoice Return Validation Test ---');

    try {
        // ... Login ...
         const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: '123456' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error('Login failed');
        token = loginData.token;
        log('Login OK');

        // ... Get Location ...
        const locRes = await fetch(`${BASE_URL}/locations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const locs = await locRes.json();
        locationId = locs[0]._id;
        log(`Using Location: ${locs[0].name}`);

        // ... Create Sample ...
        const sampleRes = await fetch(`${BASE_URL}/samples`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name: 'Inv Return Item', 
                styleNo: 'INV-RET-02', 
                quantity: 10,
                sampleType: 'proto',
                itemNumber: `INV-RET-CODE-${Date.now()}`
            })
        });
        const sample = await sampleRes.json();
        sampleId = sample._id;
        log(`Created Sample: ${sample.sku}`);

        // ... Create Invoice ...
        const invRes = await fetch(`${BASE_URL}/invoices`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                toLocationId: locationId,
                recipientName: 'Test Client',
                sourceLocationId: locationId,
                invoiceType: 'Returnable',
                remarks: 'Test Invoice for Return',
                items: [
                    { sampleId: sampleId, quantity: 2, notes: 'Outgoing' }
                ]
            })
        });
        const invoice = await invRes.json();
        if(!invRes.ok) throw new Error('Invoice Failed: ' + JSON.stringify(invoice));
        invoiceNo = invoice.invoiceNo;
        log(`Created Invoice: ${invoiceNo}`);

        // ... Test Invalid ...
        const failRes = await fetch(`${BASE_URL}/samples/${sampleId}/return`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                locationId: locationId,
                quantity: 1,
                notes: 'Should Fail',
                invoiceNo: 'INVALID-INV-999'
            })
        });
        if (failRes.status === 404) {
            log('PASS: Invalid Invoice rejected correctly (404)');
        } else {
            log(`FAIL: Invalid Invoice should fail, got: ${failRes.status}`);
        }

        // ... Test Valid ...
        const successRes = await fetch(`${BASE_URL}/samples/${sampleId}/return`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                locationId: locationId,
                quantity: 1,
                notes: 'Returning from Client',
                invoiceNo: invoiceNo
            })
        });

        if (successRes.ok) {
            const data = await successRes.json();
            log('PASS: Valid Invoice Return successful.');
        } else {
            log(`FAIL: Valid Invoice Return failed: ${successRes.status}`);
            const txt = await successRes.text();
            log('Error Body: ' + txt);
        }

    } catch (e) {
        log('Error: ' + e.message);
        if(e.cause) log('Cause: ' + e.cause);
    } finally {
        fs.writeFileSync('test_result_debug.txt', logBuffer);
        console.log('Log written to test_result_debug.txt');
    }
}

runTest();
