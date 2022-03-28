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
    console.log(room.id);
    io.to(room.id).emit("display jobs", {
      jobsArray: room.jobsArray,
      jobIndices: room.jobIndices,
    });

    // Update active player
    room.activeUserIndex++;

    console.log(room.users);
    console.log(room.ranks);
    console.log(room.activeUserIndex);

    // If end of last player's turn
    if (room.activeUserIndex >= room.users.length) {
      // New day
      console.log("Back to 1st player!");
      room.activeUserIndex = 0;
      room.day++;
      console.log(`Day ${room.day}`);
      if (room.day > 7) {
        // New round
        room.day = 0;
        room.round++;
        console.log("New Round!");
        console.log(`Round ${room.round}`);
      }
    }

    // Send new turn request to active player
    console.log(data.userIndex);
    io.to(room.users[room.order[room.activeUserIndex]].id).emit("start turn");
  });
};
