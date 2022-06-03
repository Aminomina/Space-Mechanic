const roomData = require("../data/room-data");
const rooms = roomData.rooms;

module.exports = (socket, io) => {
  // User adds a card to their deck
  socket.on("add card", (data) => {
    const room = rooms[data.roomId - 1];
    room.users[data.userIndex].cards.push(data.cardIndex);

    io.to(socket.id).emit("update cards", room.users[data.userIndex].cards);
  });
};
