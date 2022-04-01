var socket = io(); // Set up socket.io

// VARIABLES
let userName;
let userId;
let userList = [];
let userIndex;

const game = {
  // PROPERTIES
  order: [0, 1, 2, 3],
  isTurn: false,
  jobsArray: [],
  waitingRoomElement: document.getElementById("waiting-room"),
  gameContentElement: document.getElementById("game-content"),

  // METHODS
  // Close waiting room screen and start the game
  startGame: function () {
    socket.emit("start game", roomId);
  },

  // OBSOLETE
  // reorderPlayers: function (rollArray) {
  //   let index;
  //   let newUserList = [];
  //   for (const user of userList) {
  //     index = rollArray.indexOf(Math.max(...rollArray));
  //     rollArray[index] = 0;
  //     newUserList.push(userList[index]);
  //   }
  //   userList = newUserList.reverse();
  //   return;
  // },

  // Give each player a userIndex property      (MOVE SERVER SIDE?)
  initializePlayerInfo: function () {
    i = 0;
    for (const user of userList) {
      // user.order = i;
      if (user.id === userId) {
        userIndex = i;
      }
      i++;
    }
  },

  // Request a new jobsArray from server
  requestJobsArray: function () {
    socket.emit("generate jobs", roomId);
  },

  // Start a new round
  startRound: function () {
    dialogue.closeDialogueBox();
    info.showPlayerList();
    board.homeShips();
    console.log(userList);
    if (userId === userList[game.order[0]].id) {
      console.log("I'm the active player!");
      game.requestJobsArray();
      game.startTurn();
    }
  },

  // Check if user has pressed ESC key
  checkEscape: function (event) {
    if (
      event.key === "Escape" &&
      dialogue.dialogueBox.style.display === "block"
    ) {
      const isjobDetailVisible =
        document.getElementById("job-detail").style.display === "block";
      if (isjobDetailVisible) {
        dialogue.closeDialogueBox();
      }
    }
  },

  // Start client's turn
  startTurn: function () {
    console.log("It's my turn now!");
    game.isTurn = true;
    dashboard.endTurnButton.addEventListener("click", dashboard.endTurn);
  },
};

// EVENT LISTENERS
// Manage Escape key press
document.addEventListener("keydown", game.checkEscape);

// SOCKET.IO
// Game begins
socket.on("start game", function () {
  // Hide waiting room, show game content
  game.waitingRoomElement.style.display = "none";
  game.gameContentElement.style.display = "flex";
  game.initializePlayerInfo();
  console.log(board.sectionElement);
  board.drawGrid();
  info.showPlayerList();
  dialogue.openAllRollDice();
});

// Start of turn
socket.on("start turn", function () {
  game.startTurn();
});

// Server sends an updated player location
socket.on("update player location", function (data) {
  // Update action status
  userList[data.userIndex].actionStatus = data.actionStatus;
  // Update job
  if ("jobId" in data) {
    userList[data.userIndex].site = game.jobsArray[data.jobId].name;
  } else {
    userList[data.userIndex].site = {};
  }
  if (data.actionStatus === 3) {
    // In open space
  } else if (data.actionStatus === 2) {
    // At job
    board.movePlayerToJob(data.userIndex, game.jobsArray[data.jobId]);
    if (
      dashboard.turnInfo.newJobChoice.jobId === data.jobId &&
      data.userIndex !== userIndex &&
      game.jobsArray[data.jobId].status !== 0
    ) {
      // Client's registered job claimed by someone else
      console.log(game.jobsArray[data.jobId].status);
      dashboard.deregisterJob();
      board.clearJobLines();
      dashboard.updateLocationString();
    }
  } else if (data.actionStatus === 1) {
    // In transit
    userList[data.userIndex].coordinates = data.coordinates;
    if (
      board.distanceBetween(
        data.coordinates,
        game.jobsArray[data.jobId].coordinates
      ) < 5
    ) {
      console.log("Too close together!");
      let boardOffset = board.localToGlobalOffset(
        [-6, 0],
        (270 - data.angle) / 57.3
      );
      userList[userIndex].boardCoordinates = [
        data.coordinates[0] + boardOffset[0],
        data.coordinates[1] + boardOffset[1],
      ];
      board.moveShip(data.userIndex, [
        userList[userIndex].boardCoordinates[0],
        userList[userIndex].boardCoordinates[1],
        data.angle,
      ]);
    } else {
      board.moveShip(data.userIndex, [
        data.coordinates[0],
        data.coordinates[1],
        data.angle,
      ]);
    }
    if (data.userIndex === userIndex) {
      // Player being updated is client
      dashboard.registerJob(data.jobId);
    }
  } else if (data.actionStatus === 0) {
    // At home
  }
  // Update location string
  dashboard.updateLocationString();
});
