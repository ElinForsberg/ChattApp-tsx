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

//här kan man göra en variabel som tar in lista på alla rum. om rummet redan finns, lägg inte till annars lägg till. bygg logik för detta

io.on("connection", (socket) => {
    console.log("New user connected: ", socket.id);

    socket.on("join_room", (room) => {
        //här lämna de rum som är med i redan
        if (socket.currentRoom) {
            socket.leave(socket.currentRoom);
            console.log(`User left room: ${socket.currentRoom}`);
          }
          
          socket.join(room);
          socket.currentRoom = room; // Store the current room
          console.log(io.sockets.adapter.rooms);
    })


socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    console.log(data);
  });

  socket.on("leave_room", () => {
    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
      console.log(`User left room: ${socket.currentRoom}`);
      socket.currentRoom = null;
    }
});
});



server.listen(3000, () => console.log("Server is up and running"));

