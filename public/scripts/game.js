var socket = io(); // Set up socket.io

// VARIABLES
let userName;
let userId;
let userList = [];
let userIndex;

const game = {
  // Properties
  isTurn: false,
  jobsArray: [],
  // Methods
  reorderPlayers: function (rollArray) {
    let index;
    let newUserList = [];
    for (const user of userList) {
      index = rollArray.indexOf(Math.max(...rollArray));
      rollArray[index] = 0;
      newUserList.push(userList[index]);
    }
    userList = newUserList.reverse();
    return;
  },
  initializePlayerInfo: function () {
    i = 0;
    for (const user of userList) {
      user.order = i;
      if (user.id === userId) {
        userIndex = i;
      }
      i++;
    }
  },
  requestJobsArray: function () {
    socket.emit("generate jobs", roomId);
  },
  startRound: function () {
    // dialogue.dialogueBox.style.display = "none";
    dialogue.closeDialogueBox();
    info.showPlayerList();
    if (userId === userList[0].id) {
      console.log("I'm the active player!");
      game.requestJobsArray();
      game.isTurn = true;
    }
  },
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
};

// EVENT LISTENERS
// Manage Escape key press
document.addEventListener("keydown", game.checkEscape);

// SOCKET.IO
// Game begins
socket.on("start game", function () {
  // Hide waiting room, show game content
  waitingRoomElement.style.display = "none";
  gameContentElement.style.display = "flex";
  game.initializePlayerInfo();
  console.log(board.sectionElement);
  board.drawGrid();
  info.showPlayerList();
  dialogue.openAllRollDice();
  // dialogue.openJobDetail();
  // game.startRound();
});
