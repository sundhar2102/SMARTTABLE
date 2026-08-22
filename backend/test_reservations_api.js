const API_BASE_URL = 'http://localhost:5000/api';

async function testReservationsApi() {
  try {
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'user123' })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.success) {
      throw new Error('Login failed: ' + loginJson.message);
    }
    const token = loginJson.token;

    const res = await fetch(`${API_BASE_URL}/reservations`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (res.status === 200 && json.success) {
      console.log(`✅ Reservations API fetched successfully! Found ${json.count} reservations.`);
      process.exit(0);
    } else {
      console.error('❌ Reservations API check failed:', res.status, json);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Reservations API check threw error:', err.message);
    process.exit(1);
  }
}

testReservationsApi();
