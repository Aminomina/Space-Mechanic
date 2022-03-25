//   Initializing rooms
const rooms = [];
const numRooms = 5;
for (var i = 0; i < numRooms; i++) {
  const room = {
    id: i + 1,
    users: [],
    numRounds: 5,
    inUse: false,
    isStarted: false,
    playerCounter: 0,
    ranks: [],
    activeUserIndex: 0,
    jobsArray: [],
  };
  rooms.push(room);
}

module.exports = {
  rooms: rooms,
};
