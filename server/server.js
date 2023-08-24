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

        const rooms = socket.rooms;

        socket.leaveAll(rooms, function(err){
          
        })
        
        socket.join(room);
      
        console.log(socket.rooms);
        console.log(io.sockets.adapter.rooms);
    })


socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    console.log(data);
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });
  
  socket.on("not_typing", (username) => {
    socket.broadcast.emit("not_typing", username);
  });


  socket.on("users_in_room", (users)=>{
    socket.broadcast.emit("users_in_room",users)
  })

})
server.listen(3000, () => console.log("Server is up and running"));

