// VARIABLES

// SETUP
//   Importing external packages
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const res = require("express/lib/response");
const { randomUUID } = require("crypto");

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

//   Initializing rooms
const rooms = [];
const numRooms = 5;
for (var i = 0; i < numRooms; i++) {
  const room = {
    id: i + 1,
    users: [],
    numRounds: 5,
    inUse: false,
    isStarted: false,
    playerCounter: 0,
  };
  rooms.push(room);
}

// FUNCTIONS
//   Assign player color
function assignPlayerColor(users) {
  const playerColors = ["red", "blue", "purple", "green"];
  for (const color of playerColors) {
    let isTaken = false;
    for (const user of users) {
      if (user.color === color) {
        isTaken = true;
      }
    }
    if (!isTaken) {
      // If color isn't taken, assign to new player
      return color;
    }
  }
}

// ROUTES
//   Home Page
app.get("/", function (req, res) {
  res.render("index");
});

//   Rooms
app.get("/game/:id", function (req, res) {
  const roomId = req.params.id;
  for (const room of rooms) {
    console.log(room.id);
    if (room.id == roomId) {
      return res.render("game", { room: room });
    }
  }
});

//   Start New Game
app.post("/", function (req, res) {
  for (const room of rooms) {
    if (!room.inUse) {
      res.redirect("/game/" + room.id);
      console.log("starting a new game in room " + room.id);
      return;
    }
  }
  // No rooms available
  console.log("No rooms are available right now.");
  res.redirect("/no-rooms-left");
});

//   No Room
app.get("/no-room", function (req, res) {
  res.render("no-room");
});

//   Game Already Started
app.get("/game-started", function (req, res) {
  res.render("game-started");
});

//   No Rooms Left
app.get("/no-rooms-left", function (req, res) {
  res.render("no-rooms-left");
});

//   Game
app.get("/game", function (req, res) {
  res.render("game");
});

// SOCKET.IO
io.on("connection", (socket) => {
  // New user connects, query for room
  io.to(socket.id).emit("room query");
  // User responds with room ID
  socket.on("room reply", (roomId) => {
    const room = rooms[roomId - 1];
    if (room.isStarted) {
      // Game in session
      console.log("Game has already begun!");
      io.to(socket.id).emit("kick out", 1);
      return;
    } else if (room.users.length >= 4) {
      // Room is full
      console.log("Room is full!");
      io.to(socket.id).emit("kick out", 0);
      return;
    } else {
      // Room is available
      console.log("Room is available!");
      room.inUse = true;
      // Subscribe socket to the room
      socket.join(room.id);
      // Assign new player a default name and color
      room.playerCounter++;
      let user = { id: socket.id, name: "Player" + room.playerCounter };
      io.to(socket.id).emit("assign name", user.name);
      user.color = assignPlayerColor(room.users);
      room.users.push(user);
      io.to(room.id).emit("player list update", room.users);
      console.log("player joined room " + roomId);
      return;
    }
  });

  // User disconnects
  socket.on("disconnect", () => {
    for (const room of rooms) {
      console.log(room.users);
      for (let i = 0; i < room.users.length; i++) {
        if (room.users[i].id === socket.id) {
          room.users.splice(i, 1);
          io.to(room.id).emit("player list update", room.users);
          if (!room.users.length) {
            room.inUse = false;
            room.isStarted = false;
            room.playerCounter = 0;
            console.log("Room " + room.id + " is now open.");
          } else {
            io.to(room.id).emit("player list update", room.users);
          }
          return;
        }
      }
    }
  });

  // User updates their name
  socket.on("update name", (data) => {
    const room = rooms[data.roomId - 1];
    for (const user of room.users) {
      if (user.id === socket.id) {
        user.name = data.userName;
      }
    }
    io.to(room.id).emit("player list update", room.users);
    return;
  });

  // User sends a message
  socket.on("chat message", (data) => {
    const room = rooms[data.roomId - 1];
    console.log(data);
    for (const user of room.users) {
      if (user.id === socket.id) {
        data.message = user.name + ": " + data.message;
      }
    }
    io.to(room.id).emit("chat message", data.message);
  });

  // Game begins
  socket.on("start game", (roomId) => {
    const room = rooms[roomId - 1];
    room.isStarted = true;
    console.log("let the games begin!");
    io.to(room.id).emit("start game");
  });

  // User requests a jobs array
  socket.on("generate jobs", (roomId) => {
    const room = rooms[roomId - 1];
    const jobsArray = [
      {
        name: "Gigantus",
        coordinates: [-10, 10],
        jobType: 1,
        difficulty: 1.25,
        reward: 390,
      },
      {
        name: "Ark",
        coordinates: [-80, -55],
        jobType: 0,
        difficulty: 1.25,
        reward: 375,
        hazardPay: 50,
      },
      {
        name: "Androga",
        coordinates: [80, 50],
        jobType: 3,
        difficulty: 1,
        reward: 400,
      },
    ];
    console.log("Sending jobs!");
    io.to(room.id).emit("display jobs", jobsArray);
  });
});

// START SERVER
server.listen(3000, () => {
  console.log("listening on *:3000");
});
