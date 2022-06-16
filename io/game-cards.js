const roomData = require("../data/room-data");
const rooms = roomData.rooms;

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
      console.log("TEMPDAYS");
      user.bonusSpeed.tempDays += data.tempDaysAdd;
    } else if ("hold" in data) {
      console.log("HOLD");
      user.bonusSpeed.hold = data.hold;
      console.log(user.bonusSpeed.hold);
    }

    io.to(socket.id).emit("update speed bonus", {
      tempDays: user.bonusSpeed.tempDays,
      hold: user.bonusSpeed.hold,
    });
  });
};
