
const fs = require('fs');

async function runTest() {
    const BASE_URL = 'http://localhost:5000/api';
    let token = '';
    let sampleId = '';
    let locationId = '';
    let returnableInvoiceNo = '';
    let nonReturnableInvoiceNo = '';
    let logBuffer = '';

    const log = (msg) => {
        console.log(msg);
        logBuffer += msg + '\n';
    };

    log('--- Starting Strict Invoice Validation Test ---');

    try {
        // 1. Login
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email: 'admin@example.com', password: '123456' }),
            headers: { 'Content-Type': 'application/json' }
        });
        if(!loginRes.ok) throw new Error('Login Failed');
        token = (await loginRes.json()).token;
        log('Login OK');

        // 2. Setup Data (Location & Sample)
        const locs = await (await fetch(`${BASE_URL}/locations`, { headers: { 'Authorization': `Bearer ${token}` } })).json();
        locationId = locs[0]._id;
        
        const sampleRes = await fetch(`${BASE_URL}/samples`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                name: 'Strict Test Item', styleNo: 'STRICT-01', quantity: 100, itemNumber: `STRICT-${Date.now()}` 
            })
        });
        const sample = await sampleRes.json();
        sampleId = sample._id;
        log(`Created Sample: ${sample.sku}`);

        // 3. Create Non-Returnable Invoice
        const inv1Res = await fetch(`${BASE_URL}/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                toLocationId: locationId, recipientName: 'Client A', sourceLocationId: locationId,
                invoiceType: 'Non-returnable', // <--- Look here
                items: [{ sampleId: sampleId, quantity: 5 }]
            })
        });
        const inv1 = await inv1Res.json();
        nonReturnableInvoiceNo = inv1.invoiceNo;
        log(`Created Non-Returnable Invoice: ${nonReturnableInvoiceNo}`);

        // 4. Create Returnable Invoice
        const inv2Res = await fetch(`${BASE_URL}/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                toLocationId: locationId, recipientName: 'Client B', sourceLocationId: locationId,
                invoiceType: 'Returnable', // <--- Look here
                items: [{ sampleId: sampleId, quantity: 5 }]
            })
        });
        const inv2 = await inv2Res.json();
        returnableInvoiceNo = inv2.invoiceNo;
        log(`Created Returnable Invoice: ${returnableInvoiceNo}`);

        // --- TESTS ---

        // Test A: Missing Invoice No
        log('\n[Test A] Missing Invoice No...');
        const resA = await fetch(`${BASE_URL}/samples/${sampleId}/return`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ locationId, quantity: 1, invoiceNo: '' })
        });
        if (resA.status === 400) log('PASS: Rejected (400)');
        else log(`FAIL: Expected 400, got ${resA.status}`);

        // Test B: Invalid Invoice No
        log('\n[Test B] Non-existent Invoice No...');
        const resB = await fetch(`${BASE_URL}/samples/${sampleId}/return`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ locationId, quantity: 1, invoiceNo: 'INVALID-999' })
        });
        if (resB.status === 404) log('PASS: Rejected (404)');
        else log(`FAIL: Expected 404, got ${resB.status}`);

        // Test C: Non-Returnable Invoice
        log('\n[Test C] Non-Returnable Invoice...');
        const resC = await fetch(`${BASE_URL}/samples/${sampleId}/return`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ locationId, quantity: 1, invoiceNo: nonReturnableInvoiceNo })
        });
        if (resC.status === 400) {
            const err = await resC.json();
            if(err.message.includes('Non-returnable')) log('PASS: Rejected (400 - Non-returnable)');
            else log(`FAIL: Rejected but wrong message: ${err.message}`);
        }
        else log(`FAIL: Expected 400, got ${resC.status}`);

        // Test D: Item Mismatch
        // We need another invoice that is 'Returnable' but doesn't have this item.
        // Or we can use the existing `returnableInvoiceNo` but try to return a DIFFERENT sample ID that we create now.
        const otherSampleRes = await fetch(`${BASE_URL}/samples`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name: 'Other Item', styleNo: 'OTHER-01', quantity: 10, itemNumber: `OTHER-${Date.now()}` })
        });
        const otherSample = await otherSampleRes.json();
        
        log('\n[Test D] Item Mismatch (Item not in invoice)...');
        const resD = await fetch(`${BASE_URL}/samples/${otherSample._id}/return`, { // Returning 'Other Item' using 'Strict Item's invoice
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ locationId, quantity: 1, invoiceNo: returnableInvoiceNo })
        });
        if (resD.status === 400) {
             const err = await resD.json();
             if(err.message.includes('not part of Invoice')) log('PASS: Rejected (400 - Mismatch)');
             else log(`FAIL: Rejected but wrong message: ${err.message}`);
        }
        else log(`FAIL: Expected 400, got ${resD.status}`);

        // Test E: Valid Return
        log('\n[Test E] Valid Return...');
        const resE = await fetch(`${BASE_URL}/samples/${sampleId}/return`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ locationId, quantity: 1, invoiceNo: returnableInvoiceNo })
        });
        if (resE.ok) log('PASS: Return Successful');
        else {
            const txt = await resE.text();
            log(`FAIL: Expected 200, got ${resE.status}. Body: ${txt}`);
        }

    } catch (e) {
        log(`ERROR: ${e.message}`);
    } finally {
        fs.writeFileSync('test_strict_results.txt', logBuffer);
        console.log('Results written to test_strict_results.txt');
    }
}

runTest();
