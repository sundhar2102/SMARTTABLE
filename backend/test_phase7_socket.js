import { io } from "socket.io-client";

const API_URL = "http://localhost:5000";
const RESTAURANT_ID = 'on-de-roof-chennai';

async function loginAs(role) {
  let email, password;
  if (role === 'owner') {
    email = 'owner@restaurant.com';
    password = 'owner123';
  } else if (role === 'customer') {
    email = 'user@example.com';
    password = 'user123';
  } else if (role === 'superadmin') {
    email = 'admin@smarttable.ai';
    password = 'admin123';
  }

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Login failed for ${role}: ${errorText}`);
  }
  const data = await res.json();
  return data.token;
}

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => reject(err));
  });
}

function waitForEvent(socket, eventName, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${eventName}`));
    }, timeout);
    
    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

async function runTests() {
  console.log("=== Phase 7 Socket.IO Integration Tests ===");

  let ownerToken, customerToken, superAdminToken;
  try {
    ownerToken = await loginAs('owner');
    customerToken = await loginAs('customer');
    superAdminToken = await loginAs('superadmin');
  } catch(e) {
    console.error("Setup failed. Is the server and MySQL running with seeded data?", e.message);
    process.exit(1);
  }

  let ownerSocket, customerSocket, unauthSocket;

  try {
    // 1. Connection Tests
    console.log("[Test 1] Socket server starts and connects successfully...");
    unauthSocket = await connectSocket(null); // Guest
    console.log("  ✅ Guest connected");
    
    ownerSocket = await connectSocket(ownerToken);
    console.log("  ✅ Authorized Owner connected");

    customerSocket = await connectSocket(customerToken);
    console.log("  ✅ Authorized Customer connected");

    // Join rooms
    ownerSocket.emit('join_restaurant', RESTAURANT_ID);
    customerSocket.emit('join_restaurant', RESTAURANT_ID);
    
    // Wait briefly for join to process
    await new Promise(r => setTimeout(r, 500));
    
    // 2. Table Status Update Event
    console.log("[Test 2] Table update changes MySQL and emits correct event...");
    let eventPromise = waitForEvent(customerSocket, 'table_status_changed');
    
    let res = await fetch(`${API_URL}/api/tables/${RESTAURANT_ID}/ODR1/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'reserved' })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Table status API failed: ${errorText}`);
    }
    let eventData = await eventPromise;
    if (eventData.status !== 'reserved') throw new Error("Incorrect table status in event payload");
    console.log("  ✅ table_status_changed received successfully");

    // Revert table status
    eventPromise = waitForEvent(customerSocket, 'table_status_changed');
    await fetch(`${API_URL}/api/tables/${RESTAURANT_ID}/ODR1/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
      body: JSON.stringify({ status: 'available' })
    });
    await eventPromise;

    // 3. Reservation Update Event
    console.log("[Test 3] Reservation status update emits correct event...");
    // Let's create a reservation first
    res = await fetch(`${API_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        restaurantId: RESTAURANT_ID,
        partySize: 2,
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        tableId: 'Auto-Assigned'
      })
    });
    
    if (!res.ok) throw new Error("Reservation API failed");
    const resData = await res.json();
    const reservationId = resData.data.id;

    // Now update order status, should emit reservation_status_changed
    let ownerResPromise = waitForEvent(ownerSocket, 'reservation_status_changed');
    let customerResPromise = waitForEvent(customerSocket, 'reservation_status_changed');
    
    res = await fetch(`${API_URL}/api/reservations/${reservationId}/order-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
      body: JSON.stringify({ orderStatus: 'Preparing' })
    });
    
    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Update reservation API failed: ${errTxt}`);
    }
    
    let ownerEvent = await ownerResPromise;
    let customerEvent = await customerResPromise;
    
    if (ownerEvent.orderStatus !== 'Preparing') throw new Error("Owner did not get updated orderStatus");
    if (customerEvent.orderStatus !== 'Preparing') throw new Error("Customer did not get updated orderStatus");
    console.log("  ✅ reservation_status_changed received successfully for order status change");

    // Cancel reservation
    ownerResPromise = waitForEvent(ownerSocket, 'reservation_status_changed');
    res = await fetch(`${API_URL}/api/reservations/${reservationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    if (!res.ok) throw new Error("Cancel reservation API failed");
    
    ownerEvent = await ownerResPromise;
    if (ownerEvent.status !== 'Cancelled') throw new Error("Owner did not get Cancelled status");
    console.log("  ✅ reservation_status_changed received successfully for cancellation");

    // 4. Restaurant Crowd Level Update
    console.log("[Test 4] Restaurant availability/crowd level update emits correct event...");
    let crowdPromise = waitForEvent(customerSocket, 'restaurant_status_changed');
    let occPromise = waitForEvent(customerSocket, 'restaurant_occupancy_updated');
    
    res = await fetch(`${API_URL}/api/restaurants/${RESTAURANT_ID}/crowd-level`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
      body: JSON.stringify({ crowdLevel: 'high' })
    });
    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Crowd level API failed: ${errTxt}`);
    }
    
    let crowdEvent = await crowdPromise;
    let occEvent = await occPromise;
    
    if (crowdEvent.crowdLevel !== 'high') throw new Error("Customer did not get high crowd level");
    if (!occEvent.metrics) throw new Error("Missing metrics in occupancy update");
    console.log("  ✅ restaurant_status_changed received successfully");

    // 5. Admin accepting orders toggle
    console.log("[Test 5] Super Admin accepting orders toggle emits correct event...");
    let acceptPromise = waitForEvent(customerSocket, 'restaurant_status_changed');
    
    res = await fetch(`${API_URL}/api/admin/restaurants/${RESTAURANT_ID}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${superAdminToken}` },
      body: JSON.stringify({ isAcceptingOrders: false })
    });
    if (!res.ok) throw new Error("Admin API failed");
    
    let acceptEvent = await acceptPromise;
    if (acceptEvent.isAcceptingOrders !== false) throw new Error("Customer did not get false accepting orders");
    console.log("  ✅ restaurant_status_changed for accept orders received successfully");

    // Restore to true
    acceptPromise = waitForEvent(customerSocket, 'restaurant_status_changed');
    await fetch(`${API_URL}/api/admin/restaurants/${RESTAURANT_ID}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${superAdminToken}` },
      body: JSON.stringify({ isAcceptingOrders: true })
    });
    await acceptPromise;

    console.log("=========================================");
    console.log("✅ All Phase 7 Integration Tests PASSED!");
    
  } catch (err) {
    console.error("❌ TEST FAILED:", err.message);
  } finally {
    if (unauthSocket) unauthSocket.disconnect();
    if (ownerSocket) ownerSocket.disconnect();
    if (customerSocket) customerSocket.disconnect();
    process.exit(0);
  }
}

runTests();
