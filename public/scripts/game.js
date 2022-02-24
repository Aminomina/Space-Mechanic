// VARIABLES
var socket = io(); // Set up socket.io

let userName;
let userList = {};

// FUNCTIONS
function initializePlayerInfo() {
  i = 0;
  for (const user of userList) {
    user.order = i;
    user.money = 500;
    user.exp = 0;
    i++;
  }
}

function requestJobsArray() {
  socket.emit("generate jobs", roomId);
}

// SOCKET.IO
// Game begins
socket.on("start game", function () {
  // Hide waiting room, show game content
  waitingRoomElement.style.display = "none";
  gameContentElement.style.display = "flex";
  initializePlayerInfo();
  drawGrid();
  infoShowPlayerListElement();
  requestJobsArray(); // NEEDS TO BE SENT BY ONLY 1 PLAYER
  // openRollDiceDialogue(30);
});
