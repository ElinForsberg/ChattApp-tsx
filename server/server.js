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

let newUser = [];

io.on("connection", (socket) => {
    console.log("New user connected: ", socket.id);

    const username = socket.handshake.auth.username;
    
    socket.on("join_room", (room) => { 
        if (socket.currentRoom) {
            socket.leave(socket.currentRoom);
            console.log(`User left room: ${socket.currentRoom}`);
          }
          
          socket.join(room);
          socket.currentRoom = room; 

          const newUserInfo = {
            id: socket.id,
            username: username,
          };
      
          newUser.push(newUserInfo);

          const { activeRooms, usersInRoom  }= roomsHandler();
          io.emit("active_rooms", activeRooms);
          io.emit("users_in_room", usersInRoom);
          console.log("från join",activeRooms);     
    })

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    console.log(data);
  });

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
      const { activeRooms, usersInRoom }  = roomsHandler();
      io.emit("active_rooms", activeRooms);
      io.emit("users_in_room", usersInRoom);
      socket.currentRoom = null;
    }
  });
 
  socket.on("disconnect", () => {
    // Ta bort användarens socket från rummet
    socket.leave("lobby");
    const { activeRooms, usersInRoom } = roomsHandler();
    io.emit("active_rooms", activeRooms);
    io.emit("users_in_room", usersInRoom);
  });
})
  
function roomsHandler() {
  let activeRooms = [];
  let usersInRoom = [];

  const rooms = io.sockets.adapter.rooms;
  console.log("rooms by MAP: ", io.sockets.adapter.rooms);

  for (const [key, value] of rooms) {
    if (
      key !== value &&
      !(value.size === 1 && value.has(key)) &&
      !activeRooms.includes(key)
    ) {
      activeRooms.push(key);

      
      const usersIdArray = Array.from(value);  //skapar array från userId
      // id till användarnamn
      const usernamesArray = usersIdArray.map((userId) => {
      const foundUser = newUser.find((user) => user.id === userId);
        return foundUser ? foundUser.username : userId;
      });
      //skickar id array till usersInRoom
      usersInRoom.push({
        roomName: key,
        usernames: usernamesArray,
      });
    }
  }

    if (!activeRooms.includes("lobby")) {
      activeRooms.push("lobby");
    }
    return { activeRooms, usersInRoom };
}

server.listen(3000, () => console.log("Server is up and running"));

