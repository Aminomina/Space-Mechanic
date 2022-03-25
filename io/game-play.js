const roomData = require("../data/room-data");
const rooms = roomData.rooms;

module.exports = (socket, io) => {
  // User emits a message
  socket.on("chat message", (data) => {
    const room = rooms[data.roomId - 1];
    for (const user of room.users) {
      if (user.id === socket.id) {
        data.message = user.name + ": " + data.message;
      }
    }
    io.to(room.id).emit("chat message", data.message);
  });
  // Player chooses a job
  socket.on("job chosen", (data) => {
    const room = rooms[data.roomId - 1];

    // Update jobsArray
    room.jobsArray[data.jobId].status = 1;

    // Update active player
    //                                                    FUNCTION THAT UPDATES PLAYER

    io.to(data.roomId).emit("new turn", { jobsArray: room.jobsArray });
  });
};
