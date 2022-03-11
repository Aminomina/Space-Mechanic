// VARIABLES

// SETUP
//   Importing external packages
const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const res = require("express/lib/response");
const { type } = require("express/lib/response");

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
    ranks: [],
  };
  rooms.push(room);
}

// FUNCTIONS
const connections = {
  // Connect user to a room, add to rooms[x].users
  connectToRoom: function (socket, roomId) {
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
      // Assign default name, color, and other properties
      userSetup.assignDefaultProperties(socket, room);
      io.to(room.id).emit("player list update", room.users);
      console.log("player joined room " + roomId);
      return;
    }
  },

  // Handle user disconnect, remove from rooms[x].users
  userDisconnect: function (socket) {
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
  },
};

const userSetup = {
  // Assign new player default properties
  assignDefaultProperties: function (socket, room) {
    room.playerCounter++;
    let user = {
      id: socket.id,
      name: "Player" + room.playerCounter,
      money: 500,
      exp: 0,
      roll: 0,
      isReady: false,
    };
    io.to(socket.id).emit("assign name", user.name, user.id);
    user.color = userSetup.generatePlayerColor(room.users);
    room.users.push(user);
  },

  // Generate a random, unused color for a new player
  generatePlayerColor: function (users) {
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
  },

  // Change a player's name
  changeName: function (socket, roomId, userName) {
    const room = rooms[roomId - 1];
    for (const user of room.users) {
      if (user.id === socket.id) {
        user.name = userName;
      }
    }
    io.to(room.id).emit("player list update", room.users);
  },
};

const gameSetup = {
  // Prompt player clients to start the game
  startGame: function (roomId) {
    const room = rooms[roomId - 1];
    room.isStarted = true;
    console.log("let the games begin!");
    io.to(room.id).emit("start game");
  },
  // Generate an array of jobs
  generateJobs: function (roomId) {
    const locationIndices = [
      0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7,
    ];
    const room = rooms[roomId - 1];
    const numPlayers = room.users.length;
    const numJobs = [10, 10, 10]; //           PLACEHOLDER VALUES, USE NUMPLAYERS
    let jobsArray = [];
    const filePath = path.join(__dirname, "data", "planets.json");

    // Read data from planets.json
    const fileData = fs.readFileSync(filePath);
    const storedPlanets = JSON.parse(fileData);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < numJobs[i]; j++) {
        // Select job type and location
        const jobInfo = {
          typeIndex: 3 - Math.floor(Math.sqrt(Math.random() * 16)),
          locIndex:
            locationIndices[Math.floor(Math.random() * locationIndices.length)],
        };
        // job.typeIndex = 3 - Math.floor(Math.sqrt(Math.random() * 16));
        // Select a job location
        // job.locIndex =
        //   locationIndices[Math.floor(Math.random() * locationIndices.length)];

        // Select a planet
        const planet =
          storedPlanets[i][Math.floor(Math.random() * storedPlanets[i].length)];

        // let planetSelection = Math.floor(
        //   Math.random() * storedPlanets[i].length
        // );
        // let job = storedPlanets[i][planetSelection];

        let job = {
          ...jobInfo,
          ...planet,
        };

        jobsArray.push(job);
      }
    }

    // Check for same system, same planet jobs
    let jobIndices = gameSetup.findDuplicateSystems(jobsArray);
    gameSetup.findDuplicatePlanets(jobsArray, jobIndices);
    // Send jobs
    io.to(room.id).emit("display jobs", { jobsArray, jobIndices });

    // DEBUG
    for (const job of jobsArray) {
      console.log(job.name);
    }
    console.log(jobIndices);
  },
  // Find which jobs in jobsArray in the same system
  findDuplicateSystems: function (jobsArray) {
    let jobIndices = Array(jobsArray.length);
    let systemHash = {};
    let indexCounter = 0;
    for (const job of jobsArray) {
      if (job.system in systemHash) {
        // Duplicate system
        const jobIndex = systemHash[job.system];
        if (typeof jobIndices[jobIndex] !== "object") {
          // 1st duplicate
          jobIndices[jobIndex] = [jobIndices[jobIndex], indexCounter];
        } else {
          // nth duplicate
          jobIndices[jobIndex].push(indexCounter);
        }
      } else {
        // Not duplicate system
        systemHash[job.system] = indexCounter;
        jobIndices[indexCounter] = indexCounter;
      }
      indexCounter++;
    }
    // Remove empty indices
    for (let i = 0; i < jobIndices.length; i++) {
      if (jobIndices[i] === undefined) {
        jobIndices.splice(i, 1);
        i--;
      }
    }
    return jobIndices;
  },
  // Find which jobs in jobsArray are on the same planet
  findDuplicatePlanets: function (jobsArray, jobIndices) {
    for (let i = 0; i < jobIndices.length; i++) {
      if (typeof jobIndices[i] === "object") {
        const jobsInSystem = jobIndices[i];
        let systemIndices = Array(jobsInSystem);
        let planetHash = {};
        for (let j = 0; j < jobsInSystem.length; j++) {
          const planet = jobsArray[jobsInSystem[j]].name;
          if (planet in planetHash) {
            // Duplicate Planet
            const jobIndex = planetHash[planet];
            if (typeof systemIndices[jobIndex] !== "object") {
              // 1st duplicate
              systemIndices[jobIndex] = [
                systemIndices[jobIndex],
                jobsInSystem[j],
              ];
            } else {
              // nth duplicate
              systemIndices[jobIndex].push(jobsInSystem[j]);
            }
          } else {
            // Not duplicate planet
            planetHash[planet] = j;
            systemIndices[j] = jobsInSystem[j];
          }
        }
        // Remove empty indices
        for (let j = 0; j < systemIndices.length; j++) {
          if (systemIndices[j] === undefined) {
            systemIndices.splice(j, 1);
            j--;
          }
        }
        jobIndices[i] = systemIndices;
      }
    }
  },
};

const gamePlay = {
  // Send a message from one user to everyone else
  sendMessage: function (socket, roomId, message) {
    const room = rooms[roomId - 1];
    for (const user of room.users) {
      if (user.id === socket.id) {
        message = user.name + ": " + message;
      }
    }
    io.to(room.id).emit("chat message", message);
  },
};

const diceRoll = {
  // Roll for order at beginning of round
  manageRollForOrder: function (roomId, userIndex, rollResult) {
    const room = rooms[roomId - 1];
    // Set roll, isReady
    room.users[userIndex].roll = rollResult;
    room.users[userIndex].isReady = true;
    io.to(room.id).emit("all roll result", {
      userIndex: userIndex,
      rollResult: rollResult,
    });
    // Check if other users are ready
    if (!room.users.some((user) => !user.isReady)) {
      // All users are ready
      console.log("All users are ready!");
      // create roll array, check for ties
      let rolls = [];
      for (const user of room.users) {
        rolls.push(user.roll);
        user.roll = 0;
      }
      // Determine if in tie-breaker scenario or not
      if (!rolls.some((roll) => roll === 0)) {
        // Not in tie-breaker scenario
        room.ranks = diceRoll.rollToRank(rolls);
        // Check for tie, emit new player order if none
        diceRoll.checkForTie(room.id, room.ranks);
      } else {
        // Tie-breaker scenario
        console.log("Tie-breaker scenario");
        let ranks = diceRoll.rollToRank(rolls);
        for (let i = 0; i < room.users.length; i++) {
          if (ranks[i] !== 0) {
            room.ranks[i] += ranks[i] - 1;
          }
        }
        // Check for tie, emit new player order if none
        diceRoll.checkForTie(room.id, room.ranks);
      }
    } else {
      console.log("Not all users are ready!");
    }
  },

  // Check for ties during a roll-for-order
  checkForTie: function (roomId, rollArray) {
    for (let i = 0; i < rollArray.length; i++) {
      let tiedUsers = [i];
      for (let j = i + 1; j < rollArray.length; j++) {
        if (rollArray[j] === rollArray[i] && rollArray[j] !== 0) {
          tiedUsers.push(j);
        }
      }
      if (tiedUsers.length > 1) {
        // Tie found
        console.log("Tie!");
        diceRoll.reRoll(roomId, tiedUsers);
        return;
      }
    }
    // Tie not found
    console.log("Tie not found!");
    io.to(roomId).emit("all roll complete", rollArray);
  },

  // Convert roll array to ranking array
  rollToRank: function (rollArray) {
    const rankArray = new Array(rollArray.length).fill(0);
    let rank = 1;
    let instances = 0;
    let roll;
    while (rank <= rollArray.length) {
      roll = Math.max(...rollArray);
      for (let j = 0; j < rollArray.length; j++) {
        if (rollArray[j] === roll) {
          if (roll !== 0) {
            rankArray[j] = rank;
            rollArray[j] = 0;
          }
          instances++;
        }
      }
      rank += instances;
      instances = 0;
    }
    return rankArray;
  },

  // Prompt some players to re-roll
  reRoll: function (roomId, playerIndices) {
    // Set roll back to 0 for each player
    const room = rooms[roomId - 1];
    const tieString = diceRoll.generateTieString(roomId, playerIndices);
    for (const playerIndex of playerIndices) {
      room.users[playerIndex].isReady = false;
    }
    io.to(room.id).emit("reroll", {
      playerIndices: playerIndices,
      tieString: tieString,
    });
  },

  // Generate Tie String
  generateTieString: function (roomId, playerIndices) {
    const room = rooms[roomId - 1];
    const numPlayers = playerIndices.length;
    const ranking = room.ranks[playerIndices[0]];
    let messageText = "";
    console.log(numPlayers);
    if (numPlayers === 2) {
      messageText +=
        room.users[playerIndices[0]].name +
        " and " +
        room.users[playerIndices[1]].name;
    } else {
      for (i = 0; i < numPlayers - 1; i++) {
        messageText += room.users[playerIndices[i]].name + ", ";
      }
      messageText += "and " + room.users[playerIndices[numPlayers - 1]].name;
    }
    messageText += " are tied for ";
    if (ranking === 1) {
      messageText += "1st place.";
    } else if (ranking === 2) {
      messageText += "2nd place.";
    } else if (ranking === 3) {
      messageText += "3rd place.";
    } else if (ranking === 4) {
      messageText += "4th place.";
    }
    return messageText;
  },
};

// ROUTES
//   Home Page
app.get("/", function (req, res) {
  res.render("index");
});

//   Rooms
app.get("/game/:id", function (req, res) {
  const roomId = req.params.id;
  for (const room of rooms) {
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

  // User responds with room ID, connect to room if open
  socket.on("room reply", (roomId) => {
    connections.connectToRoom(socket, roomId);
  });

  // User disconnects, remove from rooms[x].users object
  socket.on("disconnect", () => {
    connections.userDisconnect(socket);
  });

  // User updates their name
  socket.on("update name", (data) => {
    userSetup.changeName(socket, data.roomId, data.userName);
  });

  // User sends a message
  socket.on("chat message", (data) => {
    gamePlay.sendMessage(socket, data.roomId, data.message);
  });

  // Game begins
  socket.on("start game", (roomId) => {
    gameSetup.startGame(roomId);
  });

  // A user rolls dice at the beginning of a round
  socket.on("all roll", (data) => {
    diceRoll.manageRollForOrder(data.roomId, data.userIndex, data.rollResult);
  });

  // User requests a jobs array
  socket.on("generate jobs", (roomId) => {
    const room = rooms[roomId - 1];
    gameSetup.generateJobs(roomId);

    // const jobsArray = [
    //   {
    //     name: "Gigantus",
    //     coordinates: [-10, 10],
    //     jobType: 1,
    //     difficulty: 1.25,
    //     reward: 390,
    //   },
    //   {
    //     name: "Ark",
    //     coordinates: [-80, -55],
    //     jobType: 0,
    //     difficulty: 1.25,
    //     reward: 375,
    //     hazardPay: 50,
    //   },
    //   {
    //     name: "Androga",
    //     coordinates: [80, 50],
    //     jobType: 3,
    //     difficulty: 1,
    //     reward: 400,
    //   },
    // ];
  });
});

// START SERVER
server.listen(3000, () => {
  console.log("listening on *:3000");
  //                                             TEST CODE
  const testArray = [
    "Shelley",
    "Verne",
    "LeGuin",
    "Mitchell",
    "Verne",
    "Vonnegut",
    "LeGuin",
    "Verne",
    "Vonnegut",
  ];
  const testOutput = Array(testArray.length);
  const testHash = {};
  let testCounter = 0;
  for (const author of testArray) {
    if (author in testHash) {
      const valueIndex = testHash[author];
      // Value is a duplicate
      if (typeof testOutput[valueIndex] !== "object") {
        // 1st duplicate
        testOutput[valueIndex] = [testOutput[valueIndex], testCounter];
      } else {
        // nth duplicate
        testOutput[valueIndex].push(testCounter);
      }
    } else {
      // Value is not a duplicate
      testHash[author] = testCounter;
      testOutput[testCounter] = testCounter;
    }
    testCounter++;
  }
  // Remove empty indices
  for (let i = 0; i < testOutput.length; i++) {
    if (testOutput[i] === undefined) {
      testOutput.splice(i, 1);
      i--;
    }
  }
  // console.log(testOutput);

  //                                             END TEST CODE
});
