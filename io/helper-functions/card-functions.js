const roomData = require("../../data/room-data");
const rooms = roomData.rooms;

const cardFunctions = {
  setDeck: function (decks, deckKey) {
    if (deckKey === "hold") {
      decks.hold = [0, 1, 2, 3];
    } else if (deckKey === "holdDiscard") {
      decks.holdDiscard = [];
    } else if (deckKey === "singleUse") {
      decks.singleUse = [4, 5, 6, 7, 8, 12, 13, 16, 18];
    } else if (deckKey === "jobEvent") {
      decks.jobEvent = [19, 20, 21, 22, 24, 25, 33];
    } else if (deckKey === "travelEvent") {
      decks.travelEvent = [27, 28, 31, 33];
    }
  },
};

module.exports = {
  cardFunctions: cardFunctions,
};
