const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const PORT = 9000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("join-room", (roomName) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room: ${roomName}`);
    io.to(roomName).emit("room-notification", {
      message: `User ${socket.id} has joined the room.`,
    });
  });

  socket.on("leave-room", (roomName) => {
    socket.leave(roomName);
    console.log(`User ${socket.id} left room: ${roomName}`);
    io.to(roomName).emit("room-notification", {
      message: `User ${socket.id} has left the room.`,
    });
  });

  socket.on("message", (data) => {
    console.log(data.displayName, data.message, data.roomName);
    io.to(data.roomName).emit("receive-message", {
      displayName: data.displayName,
      message: data.message,
    });
  });

  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      if (room !== socket.id) {
        io.to(room).emit("room-notification", {
          message: `User ${socket.id} has left the room.`,
        });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log("Server is running man");
});
