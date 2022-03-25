const roomData = require("../data/room-data");
const rooms = roomData.rooms;

// Helper functions
const setup = {
  // Assign new player default properties
  assignDefaultProperties: function (io, socket, room) {
    room.playerCounter++;
    let user = {
      id: socket.id,
      name: "Player" + room.playerCounter,
      money: 500,
      exp: 0,
      roll: 0,
      isReady: false,
    };
    io.to(socket.id).emit("assign name", user.name, user.id);
    user.color = setup.generatePlayerColor(room.users);
    room.users.push(user);
  },

  // Generate a random, unused color for a new player
  generatePlayerColor: function (users) {
    const playerColors = ["red", "blue", "purple", "green"];
    for (const color of playerColors) {
      let isTaken = false;
      for (const user of users) {
        if (user.color === color) {
          isTaken = true;
        }
      }
      if (!isTaken) {
        // If color isn't taken, assign to new player
        return color;
      }
    }
  },
};

module.exports = (socket, io) => {
  // User responds with room ID, connect to room if open
  socket.on("room reply", (roomId) => {
    // connections.connectToRoom(socket, roomId);
    const room = rooms[roomId - 1];
    if (room.isStarted) {
      // Game in session
      console.log("Game has already begun!");
      io.to(socket.id).emit("kick out", 1);
      return;
    } else if (room.users.length >= 4) {
      // Room is full
      console.log("Room is full!");
      io.to(socket.id).emit("kick out", 0);
      return;
    } else {
      // Room is available
      console.log("Room is available!");
      room.inUse = true;
      // Subscribe socket to the room
      socket.join(room.id);
      // Assign default name, color, and other properties
      setup.assignDefaultProperties(io, socket, room);
      io.to(room.id).emit("player list update", room.users);
      console.log("player joined room " + roomId);
      return;
    }
  });

  // User disconnects, remove from rooms[x].users object
  socket.on("disconnect", () => {
    // connections.userDisconnect(socket);
    for (const room of rooms) {
      console.log(room.users);
      for (let i = 0; i < room.users.length; i++) {
        if (room.users[i].id === socket.id) {
          room.users.splice(i, 1);
          io.to(room.id).emit("player list update", room.users);
          if (!room.users.length) {
            room.inUse = false;
            room.isStarted = false;
            room.playerCounter = 0;
            console.log("Room " + room.id + " is now open.");
          } else {
            io.to(room.id).emit("player list update", room.users);
          }
          return;
        }
      }
    }
  });
};
