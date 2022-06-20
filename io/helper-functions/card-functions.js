const roomData = require("../../data/room-data");
const rooms = roomData.rooms;

const cardFunctions = {
  setDeck: function (decks, deckKey) {
    if (deckKey === "hold") {
      decks.hold = [0, 1, 2, 3];
    } else if (deckKey === "holdDiscard") {
      decks.holdDiscard = [];
    } else if (deckKey === "singleUse") {
      decks.singleUse = [
        4, 5, 5, 6, 6, 7, 7, 8, 12, 12, 13, 13, 16, 16, 18, 18,
      ];
    } else if (deckKey === "jobEvent") {
      decks.jobEvent = [
        6, 6, 8, 12, 13, 13, 16, 16, 18, 19, 20, 21, 21, 22, 22, 24, 25, 33,
      ];
    } else if (deckKey === "travelEvent") {
      decks.travelEvent = [
        5, 5, 7, 7, 8, 12, 12, 13, 16, 18, 18, 27, 28, 28, 29, 29, 31, 31, 33,
      ];
    }
  },
};

module.exports = {
  cardFunctions: cardFunctions,
};
