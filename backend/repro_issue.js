
async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: '123456' })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', loginRes.status, await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token:', token ? 'YES' : 'NO');

        console.log('Creating merchandiser...');
        const createRes = await fetch('http://localhost:5000/api/auth/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Debug Merc',
                email: 'debug_merc_' + Date.now() + '@example.com',
                password: 'password123'
            })
        });

        if (!createRes.ok) {
            console.error('Create failed:', createRes.status);
            const text = await createRes.text();
            console.error('Response body:', text);
        } else {
            console.log('Merchandiser created successfully:', await createRes.json());
        }

    } catch (e) {
        console.error('Script error:', e);
    }
}

test();
