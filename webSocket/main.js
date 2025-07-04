const { validateUserToJoinRoom } = require("../controller/ValidateUserInRoom");
const CryptoJS = require("crypto-js");

// Tracks inviteId to socket.id mapping per room
const inviteSocketMap = {}; // { roomId: { inviteId: socketId } }

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, inviteId }) => {
      const matchedInvite = validateUserToJoinRoom(roomId, inviteId);
      if (!matchedInvite) {
        socket.emit("error", "User not invited.");
        return;
      }

      socket.join(roomId);
      socket.inviteId = inviteId;
      socket.roomId = roomId;

      if (!inviteSocketMap[roomId]) {
        inviteSocketMap[roomId] = {};

      }
      //send other users name and host criteria as well and show them in FE
      inviteSocketMap[roomId][inviteId] = socket.id;
      const otherUsers = Object.keys(inviteSocketMap[roomId]).filter(
        (uid) => uid !== inviteId
      );
      const decryptedRoomId = CryptoJS.AES.decrypt(roomId, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
      const roomData = JSON.parse(decryptedRoomId);
      const invites = roomData.invites || [];
      const otherUsersDetails = otherUsers.map((uid) => {
        return invites.find((invite) => invite.uid === uid) || { uid, name: "Unknown", host: false };
      });
      socket.emit("all-users", otherUsersDetails);

      socket.to(roomId).emit("user-joined", inviteId);
    });

    socket.on("sending-signal", ({ targetInviteId, signal, fromInviteId }) => {

      const room = socket.roomId;
      const targetSocketId = inviteSocketMap[room]?.[targetInviteId];
      if (targetSocketId) {
        io.to(targetSocketId).emit("user-signal", {
          signal,
          fromInviteId,
        });
      }
    });

    socket.on("returning-signal", ({ targetInviteId, signal }) => {
      const room = socket.roomId;
      const callerSocketId = inviteSocketMap[room]?.[targetInviteId];

      if (callerSocketId) {
        io.to(callerSocketId).emit("receiving-returned-signal", {
          signal,
          fromInviteId: socket.inviteId,
        });
      }
    });

    socket.on("ice-candidate", ({ targetInviteId, candidate, from }) => {
      const room = socket.roomId;
      const targetSocketId = inviteSocketMap[room]?.[targetInviteId];
      if (targetSocketId && candidate) {
        io.to(targetSocketId).emit("ice-candidate", {
          from,
          candidate,
        });
      }
    });

    socket.on("disconnect", () => {
      const { roomId, inviteId } = socket;
      if (roomId && inviteId && inviteSocketMap[roomId]) {
        delete inviteSocketMap[roomId][inviteId];
        socket.to(roomId).emit("user-left", inviteId);
        // Clean up room if empty
        if (Object.keys(inviteSocketMap[roomId]).length === 0) {
          delete inviteSocketMap[roomId];
        }
      }
    });
  });
};
