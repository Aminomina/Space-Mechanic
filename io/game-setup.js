const roomData = require("../data/room-data");
const rooms = roomData.rooms;
const fs = require("fs");
const path = require("path");

const gameSetup = {
  // Generate an array of jobs
  generateJobs: function (io, roomId) {
    const room = rooms[roomId - 1];
    const locationIndices = [
      0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7,
    ];
    const numPlayers = room.users.length;
    const numJobs = [10, 10, 10]; //           PLACEHOLDER VALUES, USE NUMPLAYERS
    let jobsArray = [];
    const filePath = path.join(__dirname, "..", "data", "planets.json");
    let jobIdCounter = 0;

    // Read data from planets.json
    const fileData = fs.readFileSync(filePath);
    const storedPlanets = JSON.parse(fileData);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < numJobs[i]; j++) {
        // Select job type and location
        const jobInfo = {
          id: jobIdCounter,
          // 0: available, 1: claimed, not fixed, 2: fixed
          status: 0,
          typeIndex: 3 - Math.floor(Math.sqrt(Math.random() * 16)),
          locIndex:
            locationIndices[Math.floor(Math.random() * locationIndices.length)],
        };

        // Select a planet
        const planet =
          storedPlanets[i][Math.floor(Math.random() * storedPlanets[i].length)];

        let job = {
          ...jobInfo,
          ...planet,
        };

        jobsArray.push(job);
        jobIdCounter++;
      }
    }

    // Check for same system, same planet jobs
    let jobIndices = gameSetup.findDuplicateSystems(jobsArray);
    gameSetup.findDuplicatePlanets(jobsArray, jobIndices);
    // Send jobs
    io.to(room.id).emit("display jobs", { jobsArray, jobIndices });

    room.jobsArray = jobsArray;
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

module.exports = (socket, io) => {
  // Game begins
  socket.on("start game", (roomId) => {
    // gameSetup.startGame(roomId);
    const room = rooms[roomId - 1];
    room.isStarted = true;
    console.log("let the games begin!");
    io.to(room.id).emit("start game");
  });
  // User requests a jobs array
  socket.on("generate jobs", (roomId) => {
    gameSetup.generateJobs(io, roomId);
  });
};
