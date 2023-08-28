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
let users = [];

io.on("connection", (socket) => {
    console.log("New user connected: ", socket.id);

    socket.on("join_room", (room, username) => {

        if (socket.currentRoom) {
            socket.leave(socket.currentRoom);
            console.log(`User left room: ${socket.currentRoom}`);
          }
          
          socket.join(room, username);
          socket.currentRoom = room; 
          if (!activeRooms.includes(room)) {
            activeRooms.push(room);
          }
          if (socket.currentRoom == room && !users.includes(username)) {
            users.push(username);
            console.log("användare till lista",users);
          }
          // io.sockets.emit('activeRooms', activeRooms);

          activeRooms = activeRooms.filter(room => {
            if (room === "lobby") {
              return true; 
              //Filtrerar activeRooms. För varje rum i listan kontrolleras om det är rummet "lobby". Om det är så returneras true -"lobby" alltid behålls i listan.
            }
            const roomSize = io.sockets.adapter.rooms.get(room)?.size; //hämtar antal användare i rummet. Om roomSize är null eller undefined, betyder det att rummet är tomt, och i det fallet kommer det att filtreras bort från listan.
            return roomSize && roomSize > 0; //Om roomSize är definierad och större än noll finns användare i rummet och rummet behålls. 
          });
        
          io.sockets.emit("activeRooms", activeRooms);

          console.log(io.sockets.adapter.rooms);
          console.log("active rooms: ", activeRooms);
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
  

 


  // socket.on("users_in_room", (users)=>{
  //   socket.broadcast.emit("users_in_room",users)
  // })



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
    // Ta bort användarens socket från rummet
    socket.leave("lobby");
  
    // Uppdatera listan över aktiva rum och inkludera alltid "lobby"
    activeRooms = Array.from(new Set([...activeRooms, "lobby"]));
  
    // Filtrera bort tomma rum från listan (utom "lobby")
    activeRooms = activeRooms.filter(room => {
      if (room === "lobby") {
        return true; // Behåll alltid "lobby"
      }
      const roomSize = io.sockets.adapter.rooms.get(room)?.size;
      return roomSize && roomSize > 0;
    });
  
    io.sockets.emit("activeRooms", activeRooms);
    console.log("User Disconnected", socket.id);
    console.log("active rooms after disconnect: ", activeRooms);
  });



  // socket.on("users_in_room", (users)=>{
  //   socket.broadcast.emit("users_in_room",users)
  // })

//   socket.on("sendGif", (gifUrl) => {
//     console.log("user sent gif :", gifUrl);
//     // Broadcast the GIF data to all connected clients
//     io.emit("receiveGif", gifUrl);
//     console.log("user recieved gif :", gifUrl);
// });

})
  



server.listen(3000, () => console.log("Server is up and running"));

