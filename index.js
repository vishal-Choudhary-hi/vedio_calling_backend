// webrtc-server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (roomID) => {
    socket.join(roomID);
    const room = io.sockets.adapter.rooms.get(roomID) || new Set();
    const otherUsers = [...room].filter(id => id !== socket.id);

    // Send other users to the new user
    socket.emit("all-users", otherUsers);

    // Notify others a user joined
    socket.to(roomID).emit("user-joined", socket.id);

    // Forward signal
    socket.on("sending-signal", (payload) => {
      io.to(payload.userToSignal).emit("user-signal", {
        signal: payload.signal,
        callerID: payload.callerID,
      });
    });

    // Forward return signal
    socket.on("returning-signal", (payload) => {
      io.to(payload.callerID).emit("receiving-returned-signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      socket.broadcast.emit("user-left", socket.id);
    });
  });
});

const PORT = 8000;
server.listen(PORT, () => console.log(`Signaling server running on port ${PORT}`));
