const roomData = require("../data/room-data");
const rooms = roomData.rooms;

const diceRoll = {
  // Roll for order at beginning of round
  manageRollForOrder: function (io, roomId, userIndex, rollResult) {
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
        diceRoll.checkForTie(io, room.id, room.ranks);
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
        diceRoll.checkForTie(io, room.id, room.ranks);
      }
    } else {
      console.log("Not all users are ready!");
    }
  },

  // Check for ties during a roll-for-order
  checkForTie: function (io, roomId, rollArray) {
    const room = rooms[roomId - 1];
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
        diceRoll.reRoll(io, roomId, tiedUsers);
        return;
      }
    }
    // Tie not found
    console.log("Tie not found!");
    room.order = Array(room.users.length);
    for (i = 0; i < room.users.length; i++) {
      let index = room.ranks[i] - 1;
      room.order[index] = i;
    }
    io.to(roomId).emit("all roll complete", room.order);
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
  reRoll: function (io, roomId, playerIndices) {
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

module.exports = (socket, io) => {
  // A user rolls dice at the beginning of a round
  socket.on("all roll", (data) => {
    diceRoll.manageRollForOrder(
      io,
      data.roomId,
      data.userIndex,
      data.rollResult
    );
  });
};
