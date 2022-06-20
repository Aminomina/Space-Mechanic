const roomData = require("../data/room-data");
const rooms = roomData.rooms;

// User makes it to job
function userToPlanet(io, room, jobId, userIndex) {
  room.jobsArray[jobId].status = 1;
  // Update user coordinates
  // Using spread operator to avoid modifying planet coords
  room.users[userIndex].coordinates = [...room.jobsArray[jobId].coordinates];
  room.users[userIndex].currentJobIndex = jobId;
  io.to(room.id).emit("update player location", {
    userIndex: userIndex,
    jobId: jobId,
    actionStatus: 2,
  });
}

// Heading towards job, not there yet
function userTransit(
  io,
  room,
  jobId,
  userIndex,
  jobCoordinates,
  userCoordinates,
  distancePerTurn
) {
  // Calculate user's new coordinates
  let angle = Math.atan(
    (jobCoordinates[1] - userCoordinates[1]) /
      (jobCoordinates[0] - userCoordinates[0])
  );
  let travelCoordinates;
  if (jobCoordinates[0] - userCoordinates[0] > 0) {
    travelCoordinates = [
      distancePerTurn * Math.cos(angle),
      distancePerTurn * Math.sin(angle),
    ];
  } else {
    travelCoordinates = [
      -distancePerTurn * Math.cos(angle),
      -distancePerTurn * Math.sin(angle),
    ];
  }

  // Convert angle to degrees
  angle = 270 - angle * 57.3;
  if (jobCoordinates[0] - userCoordinates[0] < 0) {
    angle -= 180;
  }

  // Update user coordinates
  room.users[userIndex].coordinates[0] += travelCoordinates[0];
  room.users[userIndex].coordinates[1] += travelCoordinates[1];
  room.users[userIndex].currentJobIndex = -1;
  io.to(room.id).emit("update player location", {
    userIndex: userIndex,
    jobId: jobId,
    actionStatus: 1,
    coordinates: room.users[userIndex].coordinates,
    angle: angle,
  });
}

// Reset round data and calculate player ranking
function rankReset(room) {
  room.day = 1;
  room.round++;
  console.log(`Round ${room.round}`);

  // Reset player values
  for (const user of room.users) {
    user.roll = 0;
    user.isReady = false;
    user.coordinates = [0, 0];
    user.boardCoordinates = [0, 0];
    user.actionStatus = 0;
    user.site = "home base";
    user.currentJobIndex = -1;
  }

  // Determine player ranking
  let moneyArray = new Array(room.users.length);
  for (let i = 0; i < room.users.length; i++) {
    moneyArray[i] = room.users[i].money;
  }

  const moneyOrder = new Array(room.users.length).fill(0);
  const rankArray = new Array(room.users.length);
  let rank = 0;
  let money;
  money = Math.max(...moneyArray);
  for (let i = 0; i < moneyArray.length; i++) {
    if (moneyArray[i] === money) {
      if (money !== -1) {
        moneyOrder[rank] = i;
        moneyArray[i] = -1;
        rank++;
      }
    }
  }

  rankArray[moneyOrder[0]] = 1;

  for (let j = 1; j < moneyOrder.length; j++) {
    // Tie
    if (
      room.users[moneyOrder[j - 1]].money === room.users[moneyOrder[j]].money
    ) {
      rankArray[moneyOrder[j]] = rankArray[moneyOrder[j - 1]];
      // console.log(`119 rankArray${rankArray}`);
    }
    // No tie
    else {
      rankArray[moneyOrder[j]] = j + 1;
      // console.log(`125 rankArray${rankArray}`);
    }
  }

  return { moneyOrder, rankArray };
}

// End the round
function endRound(io, room, rankData) {
  io.to(room.id).emit("end round", rankData);
}

function checkEndGame(room) {
  if (room.endCondition === "rounds") {
    if (room.round > +room.numRounds) {
      return true;
    } else {
      return false;
    }
  } else if (room.endCondition === "money") {
    for (const user of room.users) {
      if (user.money >= +room.numMoney) {
        return true;
      }
    }
    return false;
  }
}

function endGame(io, room, rankData) {
  console.log("ending the game!");
  io.to(room.id).emit("end game", rankData);
}

module.exports = (socket, io) => {
  // User emits a message
  socket.on("chat message", (data) => {
    const room = rooms[data.roomId - 1];
    let message;
    let color;
    for (let i = 0; i < room.users.length; i++) {
      const user = room.users[i];
      if (user.id === socket.id) {
        message = user.name + ": " + data.message;
        color = user.color;
      }
    }
    io.to(room.id).emit("chat message", { message, color });
  });

  // Player ends turn
  socket.on("turn end", (data) => {
    const room = rooms[data.roomId - 1];
    const user = room.users[data.userIndex];
    let distancePerTurn = 30;
    let speed;

    // Check to see if user has speed bonus
    if (user.bonusSpeed.tempDays > 0) {
      speed = 2 * (1 + user.bonusSpeed.hold);
    } else {
      speed = 1 + user.bonusSpeed.hold;
    }
    distancePerTurn *= speed;

    // Check job outcome
    if ("jobId" in data.jobOutcome && data.jobOutcome.jobId >= 0) {
      console.log(data.jobOutcome.jobId);
      console.log(data.jobOutcome.status);
      room.jobsArray[data.jobOutcome.jobId].status = data.jobOutcome.status;
    }

    // Player is traveling to a job
    if (data.newJobChoice >= 0 && !data.delayTransit) {
      // Calculate distance to job
      const jobCoordinates = room.jobsArray[data.newJobChoice].coordinates;
      console.log(data.userIndex);
      const userCoordinates = room.users[data.userIndex].coordinates;
      const distance = Math.sqrt(
        (jobCoordinates[0] - userCoordinates[0]) ** 2 +
          (jobCoordinates[1] - userCoordinates[1]) ** 2
      );

      // Single-Turn Transit
      if (distance <= distancePerTurn) {
        userToPlanet(io, room, data.newJobChoice, data.userIndex);
      }
      // Multiple-Turn Transit
      else {
        userTransit(
          io,
          room,
          data.newJobChoice,
          data.userIndex,
          jobCoordinates,
          userCoordinates,
          distancePerTurn
        );
      }
      // Update speed bonus if applicable
      if (room.users[data.userIndex].bonusSpeed.tempDays > 0) {
        room.users[data.userIndex].bonusSpeed.tempDays--;
        io.to(socket.id).emit("update speed bonus", {
          tempDays: room.users[data.userIndex].bonusSpeed.tempDays,
        });
      }
    }
    // Player at job site
    else {
    }

    // Update jobsArray
    //                                         CONSIDER MODIFYING FOR COMPUTATIONAL EFFICIENCY
    io.to(room.id).emit("display jobs", {
      jobsArray: room.jobsArray,
      jobIndices: room.jobIndices,
    });

    // Update active player
    room.activeUserIndex++;

    // If end of last player's turn
    if (room.activeUserIndex >= room.users.length) {
      // New day
      console.log("Back to 1st player!");
      room.activeUserIndex = 0;
      room.day++;
      console.log(`Day ${room.day}`);
      if (room.day > 5) {
        // Reset round data and calculate player rankings
        const rankData = rankReset(room);
        // Check if game over
        if (checkEndGame(room)) {
          endGame(io, room, rankData);
        } else {
          // New round
          return endRound(io, room, rankData);
        }
      }
    }

    // Send new turn request to active user, prompt clients to update active user
    console.log(data.userIndex);
    io.to(room.users[room.order[room.activeUserIndex]].id).emit("start turn");
    io.to(room.id).emit(
      "update active player",
      room.order[room.activeUserIndex]
    );
  });

  // Player updates status
  socket.on("update player status", (data) => {
    const room = rooms[data.roomId - 1];
    console.log(data.actionStatus);
    if (data.actionStatus === 7) {
      console.log("updating player location");
      console.log("SENDING ON PTO");
      io.to(room.id).emit("update player location", {
        userIndex: data.userIndex,
        jobId: -1,
        actionStatus: 7,
        coordinates: [0, 0],
      });
      // Player at HQ
    } else if (data.actionStatus === 5) {
      console.log("updating player location");
      io.to(room.id).emit("update player location", {
        userIndex: data.userIndex,
        jobId: -1,
        actionStatus: 5,
        coordinates: [0, 0],
      });
    } else if (data.actionStatus === 4) {
      console.log("updating player location");
      io.to(room.id).emit("update player location", {
        userIndex: data.userIndex,
        jobId: -1,
        actionStatus: 4,
        coordinates: [0, 0],
      });
    } else {
      io.to(room.id).emit("update player location", {
        userIndex: data.userIndex,
        actionStatus: data.actionStatus,
      });
    }
  });

  // New player stats
  socket.on("update player stats", (data) => {
    const room = rooms[data.roomId - 1];
    const user = room.users[data.userIndex];
    for (const property in data.newUserStats) {
      user[property] = data.newUserStats[property];
    }
    io.to(room.id).emit("update player stats", {
      userIndex: data.userIndex,
      newUserStats: data.newUserStats,
    });
  });

  // Player jumps to another job in system
  socket.on("update player job", (data) => {
    const room = rooms[data.roomId - 1];
    userToPlanet(io, room, data.jobId, data.userIndex);
    // Make old job available again if not fixed
    if (
      data.oldJobId >= 0 &&
      room.jobsArray[data.oldJobId].status !== 2 &&
      data.oldJobId !== data.jobId
    ) {
      room.jobsArray[data.oldJobId].status = 0;
    }
    // Update jobsArray
    io.to(room.id).emit("display jobs", {
      jobsArray: room.jobsArray,
      jobIndices: room.jobIndices,
    });
    io.to(room.id).emit("update player location", {
      userIndex: data.userIndex,
      jobId: data.jobId,
      actionStatus: 2,
    });
  });

  // Update job status
  socket.on("update job status", (data) => {
    console.log("updating job status");
    const room = rooms[data.roomId - 1];
    // Only applies to specified job
    if (!data.affectPlanet) {
      room.jobsArray[data.jobId].status = data.status;
      io.to(room.id).emit("display jobs", {
        jobsArray: room.jobsArray,
        jobIndices: room.jobIndices,
      });
      // Job has been disabled
      if (data.status === 3) {
        io.to(room.id).emit("update player location", {
          userIndex: data.userIndex,
          jobId: -1,
          actionStatus: 6,
        });
      }
    }
    // Applies to all jobs on planet
    else {
      for (const job of room.jobsArray) {
        if (job.name === room.jobsArray[data.jobId].name) {
          job.status = data.status;
        }
      }
      io.to(room.id).emit("display jobs", {
        jobsArray: room.jobsArray,
        jobIndices: room.jobIndices,
      });
      for (let i = 0; i < room.users.length; i++) {
        if (
          room.jobsArray[room.users[i].currentJobIndex].name ===
          room.jobsArray[data.jobId].name
        ) {
          io.to(room.id).emit("update player location", {
            userIndex: i,
            jobId: -1,
            actionStatus: 6,
          });
        }
      }
    }
  });
};
