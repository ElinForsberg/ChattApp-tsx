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
        socket.join(room);
        console.log(io.sockets.adapter.rooms);
    })
})

server.listen(3000, () => console.log("Server is up and running"));

