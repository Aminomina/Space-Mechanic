const roomData = require("../data/room-data");
const rooms = roomData.rooms;
const cardFunctions =
  require("./helper-functions/card-functions").cardFunctions;
const gameSetup = require("./helper-functions/setup-functions").gameSetup;
const fs = require("fs");
const path = require("path");

module.exports = (socket, io) => {
  // Game begins
  socket.on("start game", (roomId) => {
    // gameSetup.startGame(roomId);
    const room = rooms[roomId - 1];
    room.isStarted = true;
    // Initialize card decks
    gameSetup.initializeDecks(roomId);
    console.log("let the games begin!");
    io.to(room.id).emit("start game");
  });
  // User requests a jobs array
  socket.on("generate jobs", (roomId) => {
    gameSetup.generateJobs(io, roomId);
  });
  socket.on("change end condition", (data) => {
    const room = rooms[data.roomId - 1];
    room.endCondition = data.endConditionType;
    room.numRounds = data.endConditionRounds;
    room.numMoney = data.endConditionMoney;
    console.log(room.endCondition);
    io.to(room.id).emit("change end condition", {
      endConditionType: data.endConditionType,
      endConditionRounds: data.endConditionRounds,
      endConditionMoney: data.endConditionMoney,
    });
  });
};
