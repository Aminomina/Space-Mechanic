// VARIABLES
var socket = io(); // Set up socket.io

let userName;
let userList = {};

// FUNCTIONS
function initializePlayerInfo() {
  i = 0;
  for (const id in userList) {
    userList[key].order = i;
    userList[key].money = 500;
    userList[key].exp = 0;
    i++;
  }
}

// SOCKET.IO
// Game begins
socket.on("start game", function () {
  // Hide waiting room, show game content
  waitingRoomElement.style.display = "none";
  gameContentElement.style.display = "flex";
  initializePlayerInfo();
  drawGrid();
});
