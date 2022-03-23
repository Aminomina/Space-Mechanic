// Properties, methods, and event listenters for the waiting room

// VARIABLES
const roomId = window.location.pathname.split("/").pop();

const waitingRoom = {
  // Properties
  nameFormElement: document.getElementById("name-entry"),
  startGameButtonElement: document.getElementById("start-game-button"),

  // Methods
  updateName: function (newName) {
    const playerNameElement = document.getElementById("player-name-display");
    playerNameElement.textContent = newName;
  },
};

// EVENT LISTENERS
// User updates their name
waitingRoom.nameFormElement.addEventListener("submit", function (event) {
  const nameInputElement = document.getElementById("set-name");
  event.preventDefault();
  if (nameInputElement.value) {
    userName = nameInputElement.value;
    socket.emit("update name", { userName, roomId });
    nameInputElement.value = "";
    waitingRoom.updateName(userName);
  }
});

waitingRoom.startGameButtonElement.addEventListener("click", game.startGame);

// SOCKET.IO
// Server queries player for room id
socket.on("room query", function () {
  socket.emit("room reply", roomId);
});

// Player is assigned a default name upon joining
socket.on("assign name", function (defaultName, assignedId) {
  userName = defaultName;
  waitingRoom.updateName(userName);
  userId = assignedId;
  console.log(userId);
});

// Server updates player list
socket.on("player list update", function (users) {
  const joinedPlayersElement = document.getElementById("joined-players");
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
