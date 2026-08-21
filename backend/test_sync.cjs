const { io } = require('socket.io-client');


async function testSync() {
  console.log("Connecting socket...");
  const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log("Socket connected! joining room...");
    socket.emit('join_restaurant', 'on-de-roof-chennai');
  });

  socket.on('table_status_changed', (data) => {
    console.log("RECEIVED SYNC EVENT FROM SOCKET:", data);
    process.exit(0);
  });

  socket.on('connect_error', (err) => {
    console.error("Socket error", err);
  });

  // wait 2 seconds, then trigger an update via API
  setTimeout(async () => {
    console.log("Triggering PATCH update...");
    try {
      // Need auth to patch! We will generate a quick token for the owner.
      const jwt = require('jsonwebtoken');
      require('dotenv').config();
      const token = jwt.sign({ id: 'owner-test-id' }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Note: the backend checks user role via auth middleware, wait, the API uses requireAuth middleware.
      // `requireAuth` reads token and sets req.user.
      // But does `PATCH /tables/:restaurantId/:tableId/status` check if user is owner?
      // Let's assume yes. But if `owner-test-id` is not a real user, it might fail. Let's use the real owner ID from earlier: TvAX...
      // Or just run raw sql? No, the user said "Fix synchronization between MySQL status updates and Socket.IO broadcasts".
      // Let's just hit the API with a valid token.
      
      const db = require('./database/db.js');
      const users = await db.queryAll('SELECT * FROM users WHERE role="owner" LIMIT 1');
      if (!users.length) throw new Error('No owner found');
      
      const ownerToken = jwt.sign({ id: users[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      const res = await fetch('http://localhost:5000/api/tables/on-de-roof-chennai/ANN1/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + ownerToken
        },
        body: JSON.stringify({ status: 'reserved', minsRemaining: 45 })
      });
      
      const json = await res.json();
      console.log("API response:", json);
      
    } catch (e) {
      console.error(e);
    }
  }, 2000);
}

testSync();
