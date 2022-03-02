// VARIABLES
var socket = io(); // Set up socket.io

let userName;
let userId;
let userList = [];
let userIndex;

// FUNCTIONS
const game = {
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
};

// function initializePlayerInfo() {
//   i = 0;
//   for (const user of userList) {
//     user.order = i;
//     if (user.id === userId) {
//       userIndex = i;
//     }
//     i++;
//   }
// }

// function requestJobsArray() {
//   socket.emit("generate jobs", roomId);
// }

function newRound() {
  // Dialogue opens, each player receives a random card from the home deck
  // If any player has a beginning-of-round card, they are prompted and can choose to play it
  // Waiting screen opens while other players are drawing cards.
  // A dice roll dialogue opens with as many dice as players.
  // Each player rolls, and whoever gets the highest roll goes first.
  // If two players roll the same number, they are prompted to roll again.
  // Players are ordered left to right in the dialogue with numbers to show the new order for the round.
  // The player sidebar is set to active and the new order is displayed.
  // The dialogue closes and the new order is shown on the player tab of the info bar.
  // A new list of jobs is generated and the first player's turn begins.
}

// SOCKET.IO
// Game begins
socket.on("start game", function () {
  // Hide waiting room, show game content
  waitingRoomElement.style.display = "none";
  gameContentElement.style.display = "flex";
  game.initializePlayerInfo();
  drawGrid();
  infoShowPlayerListElement();
  dialogue.openAllRollDice();

  // if (userId === userList[0].id) {
  //   console.log("I'm the active player!");
  //   requestJobsArray();
  // }
  // openRollDiceDialogue(30);
});
