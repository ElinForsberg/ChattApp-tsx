const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { log } = require("console");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.use(cors());


function roomsHandler() {
  let activeRooms = [];
  let usersById = [];

  const rooms = io.sockets.adapter.rooms;
  console.log("rooms by MAP: ", io.sockets.adapter.rooms);

  for (const [key, value] of rooms) {
    if (
      key !== value &&
      !(value.size === 1 && value.has(key)) &&
      !activeRooms.includes(key)
    ) {
      activeRooms.push(key);
    }
  }
    if (!activeRooms.includes("lobby")) {
      activeRooms.push("lobby");
    }
    return { activeRooms };
}




io.on("connection", (socket) => {
    console.log("New user connected: ", socket.id);

    socket.on("join_room", (room) => {

        if (socket.currentRoom) {
            socket.leave(socket.currentRoom);
            console.log(`User left room: ${socket.currentRoom}`);
          }
          
          socket.join(room);
          socket.currentRoom = room; 

          const { activeRooms }= roomsHandler();
          io.emit("active_rooms", activeRooms);
          console.log("från join",activeRooms);
          
    })

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    console.log(data);
  });


//Sends user is typing in the same room as the writer
  socket.on("typing", (username) => {
    socket.to(socket.currentRoom).emit("typing", username); 

  });
  socket.on("not_typing", (username) => {

     socket.to(socket.currentRoom).emit("not_typing", username); 

  });
  
  socket.on("leave_room", () => {
    if (socket.currentRoom && socket.currentRoom !== "lobby") { //kollar om användare är i ett rum - om och om rummet som lämnas inte är lobbyn
      socket.leave(socket.currentRoom); //
      console.log(`User left room: ${socket.currentRoom}`);
      const { activeRooms }  = roomsHandler();
      io.emit("active_rooms", activeRooms);
      socket.currentRoom = null;
    }
  });
 
  socket.on("disconnect", () => {
    // Ta bort användarens socket från rummet
    socket.leave("lobby");
    const { activeRooms } = roomsHandler();
    io.emit("active_rooms", activeRooms);
  });


})
  



server.listen(3000, () => console.log("Server is up and running"));

