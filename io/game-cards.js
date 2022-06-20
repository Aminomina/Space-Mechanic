const e = require("express");
const roomData = require("../data/room-data");
const rooms = roomData.rooms;
const cardFunctions =
  require("./helper-functions/card-functions").cardFunctions;
const gameSetup = require("./helper-functions/setup-functions").gameSetup;

module.exports = (socket, io) => {
  // User adds a card to their deck
  socket.on("add cards", (data) => {
    console.log("adding cards");
    const room = rooms[data.roomId - 1];
    for (const cardIndex of data.cardIndices) {
      room.users[data.userIndex].cards.push(cardIndex);
    }

    io.to(socket.id).emit("update cards", room.users[data.userIndex].cards);
  });
  socket.on("remove cards", (data) => {
    console.log("removing cards");
    const room = rooms[data.roomId - 1];
    const user = room.users[data.userIndex];
    const numRemove = data.cardIndices.length;
    for (let i = 0; i < numRemove; i++) {
      const cardIndex = user.cards[data.cardIndices[i]];
      if (cardIndex <= 3) {
        room.decks.hold.push(cardIndex);
        console.log(room.decks.hold);
      }
      user.cards[data.cardIndices[i]] = undefined;
    }
    for (let i = user.cards.length - 1; i >= 0; i--) {
      if (user.cards[i] === undefined) {
        user.cards.splice(i, 1);
      }
    }
    console.log(user.cards);

    io.to(socket.id).emit("update cards", user.cards);
  });
  socket.on("add speed bonus", (data) => {
    console.log("adding speed bonus");
    const room = rooms[data.roomId - 1];
    const user = room.users[data.userIndex];
    if ("tempDays" in data) {
      user.bonusSpeed.tempDays += data.tempDaysAdd;
    } else if ("hold" in data) {
      user.bonusSpeed.hold = data.hold;
      console.log(user.bonusSpeed.hold);
    }

    io.to(socket.id).emit("update speed bonus", {
      tempDays: user.bonusSpeed.tempDays,
      hold: user.bonusSpeed.hold,
    });
  });
  socket.on("draw commodity card", (data) => {
    console.log("drawing commodity card");
    const room = rooms[data.roomId - 1];
    const singleUseLength = room.decks.singleUse.length;
    const holdLength = room.decks.hold.length;
    const commodityLength = singleUseLength + holdLength;
    let cardIndex;

    //Select a card at random
    const commodityIndex = Math.floor(Math.random() * commodityLength);

    // Card is singleUse
    if (commodityIndex < singleUseLength) {
      console.log("singleUse");
      cardIndex = room.decks.singleUse.splice(commodityIndex, 1)[0];
      // Check if last singleUse card was taken
      if (singleUseLength <= 1) {
        console.log("resetting singleUse deck");
        cardFunctions.setDeck(room.decks, "singleUse");
      }
    }
    // Card is hold
    else {
      console.log("hold");
      const holdIndex = commodityIndex - singleUseLength;
      cardIndex = room.decks.hold.splice(holdIndex, 1)[0];
      room.decks.holdDiscard.push(cardIndex);
    }
    io.to(socket.id).emit("draw card vanish", cardIndex);
    // Check if all players are ready
    room.users[data.userIndex].isReady = true;
    let allReady = true;
    for (const user of room.users) {
      if (user.isReady === false) {
        allReady = false;
      }
    }
    if (allReady) {
      console.log("everyone's ready!");
      // Reset isReady
      for (const user of room.users) {
        user.isReady = false;
      }
      // Start Round
      io.to(room.id).emit("start round");
    }
  });
  socket.on("draw event card", (data) => {
    console.log("drawing event card");
    const room = rooms[data.roomId - 1];
    const jobEventLength = room.decks.jobEvent.length;
    const travelEventLength = room.decks.travelEvent.length;
    let cardIndex;

    // Jobsite Event
    if (data.isJobEvent) {
      const jobEventIndex = Math.floor(Math.random() * jobEventLength);
      console.log("jobEvent");
      console.log(jobEventIndex);
      cardIndex = room.decks.jobEvent.splice(jobEventIndex, 1)[0];
      console.log(cardIndex);
      if (jobEventLength <= 1) {
        console.log("resetting jobEvent deck");
        cardFunctions.setDeck(room.decks, "jobEvent");
      }
    }
    // Travel Event
    else {
      const travelEventIndex = Math.floor(Math.random() * travelEventLength);
      console.log("travelEvent");
      cardIndex = room.decks.travelEvent.splice(travelEventIndex, 1)[0];
      if (travelEventLength <= 1) {
        console.log("resetting travelEvent deck");
        cardFunctions.setDeck(room.decks, "travelEvent");
      }
    }

    // Prompt user to draw card
    io.to(socket.id).emit("draw card", cardIndex);
  });
};
