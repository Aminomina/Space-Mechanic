const roomData = require("../data/room-data");
const rooms = roomData.rooms;

module.exports = (socket, io) => {
  // User updates their name
  socket.on("update name", (data) => {
    const room = rooms[data.roomId - 1];
    for (const user of room.users) {
      if (user.id === socket.id) {
        user.name = data.userName;
      }
    }
    io.to(room.id).emit("player list update", room.users);
  });
};
