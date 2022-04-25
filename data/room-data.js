//   Initializing rooms
const rooms = [];
const numRooms = 5;
for (var i = 0; i < numRooms; i++) {
  const room = {
    id: i + 1,
    users: [],
    numRounds: 10,
    numMoney: 10000,
    endCondition: "rounds",
    inUse: false,
    isStarted: false,
    playerCounter: 0,
    ranks: [],
    order: [],
    activeUserIndex: 0,
    jobsArray: [],
    jobIndices: [],
    round: 1,
    day: 1,
  };
  rooms.push(room);
}

module.exports = {
  rooms: rooms,
};
