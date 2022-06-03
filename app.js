// SETUP
//   Importing external packages
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const res = require("express/lib/response");
const { type } = require("express/lib/response");

//   Including data files
const roomData = require("./data/room-data");
const rooms = roomData.rooms;

//   Including routes
const routes = require("./routes");

//   Setting up the app with express
const app = express();

//   Setting up socket.io server
const server = http.createServer(app);
const io = new Server(server);

//   Setting up "views" folder and EJS for dynamic files
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//   Setting up "public" folder for static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// ROUTES
app.use("/", routes);

// app.use((req, res) => {
//   res.status(404).render("404");
// });

app.use(function (req, res) {
  console.log("404");
  res.status(404).render("404");
});

app.use((error, req, res, next) => {
  res.status(500).render("500");
});

// SOCKET.IO
io.on("connection", (socket) => {
  // New user connects, query for room
  io.to(socket.id).emit("room query");

  // Check for other events
  require("./io/game-play")(socket, io);
  require("./io/connections")(socket, io);
  require("./io/user-setup")(socket, io);
  require("./io/game-setup")(socket, io);
  require("./io/dice-roll")(socket, io);
  require("./io/game-cards")(socket, io);
});

// START SERVER
server.listen(3000, () => {
  console.log("listening on *:3000");
});
