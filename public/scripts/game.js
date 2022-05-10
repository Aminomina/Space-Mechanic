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
  gameSessionElement: document.getElementById("info-board-bottom"),
  endConditionType: "rounds",
  endConditionRounds: 10,
  endConditionMoney: 10000,
  currentRound: 1,

  // METHODS
  // Close waiting room screen and start the game
  startGame: function () {
    socket.emit("start game", roomId);
  },

  // Give each player a userIndex property      (MOVE SERVER SIDE?)
  initializePlayerInfo: function () {
    i = 0;
    for (const user of userList) {
      // user.order = i;
      if (user.id === userId) {
        userIndex = i;
        dashboard.turnInfo.userIndex = i;
      }
      i++;
    }
  },

  // Request a new jobsArray from server
  requestJobsArray: function () {
    socket.emit("generate jobs", roomId);
  },

  // Start a new round after dice roll
  startRound: function () {
    dialogue.closeDialogueBox();
    info.showPlayerList();
    board.homeShips();
    console.log(userList);
    if (userId === userList[game.order[0]].id) {
      console.log("I'm the active player!");
      game.requestJobsArray();
      game.startTurn();
    } else {
      dashboard.endTurnButton.classList.add("disabled");
    }
  },

  // End the current round and initialize a new one
  endRound: function (moneyOrder, rankArray) {
    dashboard.deregisterJob();
    board.homeShips();
    board.clearJobs();
    board.clearJobLines();

    dashboard.turnInfo = {
      roomId,
      userIndex,
      newJobChoice: -1,
      jobOutcome: {},
      newUserStats: {},
      currentJobMultiplier: undefined,
    };

    dashboard.currentJobInfo = {
      totalDiff: undefined,
      totalExp: undefined,
      totalReward: undefined,
    };

    for (const user of userList) {
      user.actionStatus = 0;
      user.currentJobIndex = -1;
      user.site = "home base";
    }

    game.currentRound++;

    info.updateRoundInfo();
    dashboard.updateLocationString();
    dialogue.openEndOfRoundDisplay(moneyOrder, rankArray);
  },

  // Check if user has pressed ESC key
  checkEscape: function (event) {
    if (
      event.key === "Escape" &&
      dialogue.dialogueBox.style.display === "block"
    ) {
      if (dialogue.dialogueBox.children[0].style.display === "block") {
        dialogue.closeDialogueBox();
      }
    }
  },

  // Start client's turn
  startTurn: function () {
    const currentJobIndex = userList[userIndex].currentJobIndex;

    console.log("It's my turn now!");
    game.isTurn = true;
    dashboard.endTurnButton.addEventListener("click", dashboard.endTurn);
    if (currentJobIndex >= 0) {
      console.log("activating roll-to-fix");
      dashboard.rollToFixButton.addEventListener(
        "click",
        dashboard.openRollToFix
      );
    }
    dashboard.endTurnButton.classList.remove("disabled");
    // Check if user must roll for hazards
    const currentJob = game.jobsArray[currentJobIndex];
    if (
      currentJob != undefined &&
      "hazard-type" in currentJob &&
      currentJob["hazard-type"] != 0 &&
      currentJob.locIndex != 6
    ) {
      console.log("Roll for hazard!");
      dashboard.openRollForHazard(
        currentJob["hazard-type"],
        currentJob["hazard-roll-string"]
      );
    }
    // Check if user can roll-to-fix
    if (
      userList[userIndex].actionStatus === 2 &&
      game.jobsArray[userList[userIndex].currentJobIndex].status === 1
    ) {
      dashboard.rollToFixButton.classList.remove("disabled");
    }
  },

  // End the game
  endGame: function (moneyOrder, rankArray) {
    console.log("Game ending");
    board.homeShips();
    board.clearJobs();
    board.clearJobLines();
    dashboard.updateJobPreview();
    dashboard.updateLocationString();
    dialogue.openEndGameDisplay(moneyOrder, rankArray);
  },

  // Ask server to reset the game
  requestResetGame: function () {
    console.log("resetting the game...");
    socket.emit("reset game", roomId);
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
  game.gameSessionElement.style.display = "flex";
  game.initializePlayerInfo();
  board.drawGrid();
  info.updateRoundInfo();
  info.showPlayerList();
  dialogue.openAllRollDice();
});

// Start of turn
socket.on("start turn", function () {
  game.startTurn();
});

// Server sends updated player stats
socket.on("update player stats", function (data) {
  const user = userList[data.userIndex];
  for (const property in data.newUserStats) {
    user[property] = data.newUserStats[property];
  }
  info.showPlayerList();
});

// Server sends an updated player location
socket.on("update player location", function (data) {
  // Update action status
  userList[data.userIndex].actionStatus = data.actionStatus;
  // Update job
  if ("jobId" in data && data.jobId !== -2) {
    userList[data.userIndex].site = game.jobsArray[data.jobId].name;
  } else {
    userList[data.userIndex].site = {};
  }
  if (data.actionStatus === 4) {
    // In the hospital
    userList[data.userIndex].coordinates = [0, 0];
    userList[data.userIndex].boardCoordinates =
      board.shipPositions[userList.length - 1][data.userIndex];
    userList[data.userIndex].currentJobIndex = -2;
    board.moveShip(data.userIndex, userList[data.userIndex].boardCoordinates);
  } else if (data.actionStatus === 3) {
    // In open space
  } else if (data.actionStatus === 2) {
    // At job
    board.movePlayerToJob(data.userIndex, game.jobsArray[data.jobId]);
    userList[data.userIndex].currentJobIndex = data.jobId;
    // Client's registered job claimed by someone else
    if (
      dashboard.turnInfo.newJobChoice === data.jobId &&
      data.userIndex !== userIndex
      // && game.jobsArray[data.jobId].status !== 0
    ) {
      console.log(game.jobsArray[data.jobId].status);
      dashboard.deregisterJob();
      socket.emit("update player status", {
        roomId: roomId,
        userIndex: userIndex,
        actionStatus: 3,
      });
      board.clearJobLines();
      dashboard.updateLocationString();
    }
    // Player being updated is client
    if (data.userIndex === userIndex) {
      dashboard.turnInfo.jobOutcome = { jobId: data.jobId, status: 1 };
      dashboard.turnInfo.newJobChoice = -1;
    }
  } else if (data.actionStatus === 1) {
    // In transit
    userList[data.userIndex].coordinates = data.coordinates;
    let boardOffset = board.manageShipIconOffsets(
      game.jobsArray[data.jobId].coordinates,
      data.coordinates,
      data.angle
    );
    userList[data.userIndex].boardCoordinates = [
      data.coordinates[0] + boardOffset[0],
      data.coordinates[1] + boardOffset[1],
    ];
    userList[data.userIndex].currentJobIndex = -1;
    board.moveShip(data.userIndex, [
      userList[data.userIndex].boardCoordinates[0],
      userList[data.userIndex].boardCoordinates[1],
      data.angle,
    ]);

    if (data.userIndex === userIndex) {
      // Player being updated is client
      dashboard.registerJob(data.jobId);
    }
  } else if (data.actionStatus === 0) {
    // At home
    userList[data.userIndex].currentJobIndex = -1;
  }
  // Update location string
  dashboard.updateLocationString();
});

// Server starts a new round
socket.on("end round", function (data) {
  game.endRound(data.moneyOrder, data.rankArray);
});

// Server ends the round
socket.on("end game", function (data) {
  game.endGame(data.moneyOrder, data.rankArray);
});

// Server resets the game
socket.on("reset game", function () {
  game.order = [0, 1, 2, 3];
  game.isTurn = false;
  game.jobsArray = [];
  game.currentRound = 1;
  dialogue.closeDialogueBox();
  info.resetPlayersList();
  dialogue.resetAllRollDice();
  dialogue.resetEndGameDisplay();
  game.waitingRoomElement.style.display = "block";
  game.gameSessionElement.style.display = "none";
});
