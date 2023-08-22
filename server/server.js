const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.use(cors());

let activeRooms = [];

io.on("connection", (socket) => {
    console.log("New user connected: ", socket.id);

    socket.on("join_room", (room) => {
        if (socket.currentRoom) {
            socket.leave(socket.currentRoom);
            console.log(`User left room: ${socket.currentRoom}`);
          }
          
          socket.join(room);
          socket.currentRoom = room; 
          if (!activeRooms.includes(room)) {
            activeRooms.push(room);
          }
          io.sockets.emit('activeRooms', activeRooms);

          console.log(io.sockets.adapter.rooms);
          console.log("active rooms: ", activeRooms);
    })

socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    console.log(data);
  });

  socket.on("leave_room", () => {
    if (socket.currentRoom && socket.currentRoom !== "lobby") { //kollar om användare är i ett rum - om och om rummet som lämnas inte är lobbyn
      socket.leave(socket.currentRoom); //
      console.log(`User left room: ${socket.currentRoom}`);
      const index = activeRooms.indexOf(socket.currentRoom);
      if (index !== -1) {
        activeRooms.splice(index, 1); // Ta bort rummet från activeRooms
      }
      io.sockets.emit('activeRooms', activeRooms); // Uppdaterade listan över activeRooms
      socket.currentRoom = null;
    }
  });

  socket.on("disconnect", () => {
    activeRooms = activeRooms.filter((room) => {
      return io.sockets.adapter.rooms.get(room)?.size > 0;
    });
    io.sockets.emit("activeRooms", activeRooms);
    console.log("User Disconnected", socket.id);
    console.log("active rooms after disconnect: ", activeRooms);
  });
  
});

server.listen(3000, () => console.log("Server is up and running"));

