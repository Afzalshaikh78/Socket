const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);

//initialize socket io
const io = socketIo(server);

app.use(express.static("public"));

const users = new Set();

io.on("connection", (socket) => {
  console.log("A user is now connected");

  //handle when tthey join
  socket.on("join", (userName) => {
    users.add(userName);
    socket.userName = userName;

    //broadcast
    io.emit("userJoined", userName);

    //send the updated user list to all clients
    io.emit("userList", Array.from(users));
  });

  //incoming chat messages
  socket.on("chatMessage", (message) => {
    //broadcast
    io.emit("chatMessage", message);
  });

  //user disconnection
socket.on("disconnect", () => {
  console.log("A user disconnected:", socket.userName);
  if (socket.userName) {
    users.delete(socket.userName);
    socket.broadcast.emit("userLeft", socket.userName);
    io.emit("userList", Array.from(users));
  }
});

});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
