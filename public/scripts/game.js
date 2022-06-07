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
  activeUserIndex: undefined,
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
    console.log("requesting server to start game");
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
    console.log("requesting a new set of jobs");
    socket.emit("generate jobs", roomId);
  },

  // Start a new round after dice roll
  startRound: function () {
    console.log("starting new round");
    dialogue.closeDialogueBox();
    game.activeUserIndex = game.order[0];
    dashboard.updatePlayerPreview();
    info.showPlayerList();
    board.homeShips();
    if (userIndex === game.activeUserIndex) {
      game.requestJobsArray();
      game.startTurn();
    } else {
      dashboard.endTurnButton.classList.add("disabled");
    }
  },

  // End the current round and initialize a new one
  endRound: function (moneyOrder, rankArray) {
    console.log("ending round");
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
    console.log("client set to active player");
    const currentJobIndex = userList[userIndex].currentJobIndex;
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
      // Player is on a planet with a hazard
      currentJob != undefined &&
      "hazard-type" in currentJob &&
      currentJob["hazard-type"] != 0 &&
      // The current job is not fixed
      currentJob.status !== 2 &&
      // Player is on planet (not in orbit)
      currentJob.locIndex != 6
    ) {
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
    console.log("game ending");
    board.homeShips();
    board.clearJobs();
    board.clearJobLines();
    dashboard.updateJobPreview();
    dashboard.updateLocationString();
    dialogue.openEndGameDisplay(moneyOrder, rankArray);
  },

  // Ask server to reset the game
  requestResetGame: function () {
    console.log("requesting server to reset game");
    socket.emit("reset game", roomId);
  },

  abandonJob: function () {
    console.log("abandonning job");
    dashboard.deregisterJob();
    socket.emit("update player status", {
      roomId: roomId,
      userIndex: userIndex,
      actionStatus: 3,
    });
    board.clearJobLines();
    dashboard.updateLocationString();
  },
};

// EVENT LISTENERS
// Manage Escape key press
document.addEventListener("keydown", game.checkEscape);

// SOCKET.IO
// Game begins
socket.on("start game", function () {
  console.log("game started");
  // Hide waiting room, show game content
  game.waitingRoomElement.style.display = "none";
  game.gameSessionElement.style.display = "flex";
  game.initializePlayerInfo();
  board.drawGrid();
  info.updateRoundInfo();
  info.openRulesTab(0);
  info.openTab(0);
  dashboard.updatePlayerPreview();
  info.showPlayerList();
  dialogue.openAllRollDice();
});

// Start of turn
socket.on("start turn", function () {
  game.startTurn();
});

// Server sends updated player stats
socket.on("update player stats", function (data) {
  console.log("updating player stats");
  const user = userList[data.userIndex];
  for (const property in data.newUserStats) {
    user[property] = data.newUserStats[property];
  }
  dashboard.updatePlayerPreview();
  info.showPlayerList();
});

// Server sends an updated player location
socket.on("update player location", function (data) {
  console.log("updating player location");
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
    if (game.jobsArray[data.jobId].status === 3) {
      // Client's registered job claimed by someone else or disabled
      game.abandonJob();
    } else {
      board.movePlayerToJob(data.userIndex, game.jobsArray[data.jobId]);
      userList[data.userIndex].currentJobIndex = data.jobId;
      // Player being updated is client
      if (data.userIndex === userIndex) {
        dashboard.turnInfo.jobOutcome = { jobId: data.jobId, status: 1 };
        dashboard.turnInfo.newJobChoice = -1;
      }
      if (
        dashboard.turnInfo.newJobChoice === data.jobId &&
        data.userIndex !== userIndex
      ) {
        // Client's registered job claimed by someone else
        game.abandonJob();
      }
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
    if (game.jobsArray[data.jobId].status === 3) {
      // Client's registered job was disabled
      game.abandonJob();
    } else if (data.userIndex === userIndex) {
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

// Server updates active player
socket.on("update active player", function (activeUserIndex) {
  console.log(`active player set to ${userList[activeUserIndex].name}`);
  game.activeUserIndex = activeUserIndex;
  info.showPlayerList();
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
  console.log("resetting the game");
  game.order = [0, 1, 2, 3];
  game.isTurn = false;
  game.jobsArray = [];
  game.activeUserIndex = undefined;
  game.currentRound = 1;
  dialogue.closeDialogueBox();
  info.resetPlayersList();
  dialogue.resetAllRollDice();
  dialogue.resetEndGameDisplay();
  game.waitingRoomElement.style.display = "block";
  game.gameSessionElement.style.display = "none";
});
