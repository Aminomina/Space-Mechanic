// SETUP & VARIABLES
// var socket = io(); // Set up socket.io

const waitingRoomElement = document.getElementById("waiting-room");
const gameContentElement = document.getElementById("game-content");
const nameFormElement = document.getElementById("name-entry");
const nameInputElement = document.getElementById("set-name");
const joinedPlayersElement = document.getElementById("joined-players");
const startGameButtonElement = document.getElementById("start-game-button");
const roomId = window.location.pathname.split("/").pop();

// FUNCTIONS
function updateName(newName) {
  const playerNameElement = document.getElementById("player-name-display");
  playerNameElement.textContent = newName;
}

function startGame() {
  socket.emit("start game", roomId);
}

// EVENT LISTENERS
// User updates their name
nameFormElement.addEventListener("submit", function (event) {
  event.preventDefault();
  if (nameInputElement.value) {
    userName = nameInputElement.value;
    socket.emit("update name", { userName, roomId });
    nameInputElement.value = "";
    updateName(userName);
  }
});

startGameButtonElement.addEventListener("click", startGame);

// SOCKET.IO
// Server queries player for room id
socket.on("room query", function () {
  socket.emit("room reply", roomId);
});

// Player is assigned a default name upon joining
socket.on("assign name", function (defaultName) {
  userName = defaultName;
  updateName(userName);
});

// Server updates player list
socket.on("player list update", function (users) {
  userList = users;
  console.log(users);
  while (joinedPlayersElement.lastElementChild) {
    joinedPlayersElement.removeChild(joinedPlayersElement.lastElementChild);
  }
  for (const user of users) {
    const playerElement = document.createElement("li");
    const playerImage = document.createElement("img");
    playerElement.textContent = user.name;
    playerImage.alt = "A wrench icon";
    playerImage.src = "/images/wrench-" + user.color + ".png";
    playerElement.appendChild(playerImage);
    joinedPlayersElement.appendChild(playerElement);
  }
});

// Player gets kicked out of room
socket.on("kick out", function (isGameStarted) {
  if (isGameStarted) {
    window.location.href = "/game-started";
  } else {
    window.location.href = "/no-room";
  }
});
