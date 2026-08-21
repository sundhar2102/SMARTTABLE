import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
  // Trigger a change to test the restaurant wait algorithm real-time emission
  fetch("http://localhost:5000/api/tables/on-de-roof-chennai/ODR1/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "cleaning" })
  }).then(res => res.json()).then(data => {
    console.log("Table status update triggered:", data.success);
  });
});

socket.on("restaurant_occupancy_updated", (data) => {
  console.log("✅ Received restaurant_occupancy_updated:");
  console.log(JSON.stringify(data, null, 2));
  
  // Revert the change back
  fetch("http://localhost:5000/api/tables/on-de-roof-chennai/ODR1/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "available" })
  }).then(() => {
    socket.disconnect();
    process.exit(0);
  });
});

setTimeout(() => {
  console.error("❌ Socket test timed out");
  socket.disconnect();
  process.exit(1);
}, 5000);
