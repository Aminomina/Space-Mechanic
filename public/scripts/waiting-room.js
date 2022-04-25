// Properties, methods, and event listenters for the waiting room

// VARIABLES
const roomId = window.location.pathname.split("/").pop();

const waitingRoom = {
  // Properties
  nameFormElement: document.getElementById("name-entry"),
  startGameButtonElement: document.getElementById("start-game-button"),
  playRoundsRadioElement: document.getElementById("play-rounds"),
  playMoneyRadioElement: document.getElementById("play-money"),
  numRoundsSelectElement: document.getElementById("num-rounds"),
  numMoneySelectElement: document.getElementById("num-money"),

  // Methods
  updateName: function (newName) {
    const playerNameElement = document.getElementById("player-name-display");
    playerNameElement.classList.remove("squish");
    playerNameElement.textContent = newName;
    if (playerNameElement.offsetWidth > 210) {
      playerNameElement.classList.add("squish");
    }
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

// Someone changes the end condition type to rounds
waitingRoom.playRoundsRadioElement.addEventListener("click", function () {
  if (game.endConditionType !== "rounds") {
    game.endConditionType = "rounds";
    waitingRoom.numRoundsSelectElement.style.display = "block";
    waitingRoom.numMoneySelectElement.style.display = "none";
    socket.emit("change end condition", {
      roomId,
      endConditionType: game.endConditionType,
      endConditionRounds: game.endConditionRounds,
      endConditionMoney: game.endConditionMoney,
    });
  }
});

// Someone changes the end condition type to money
waitingRoom.playMoneyRadioElement.addEventListener("click", function () {
  if (game.endConditionType !== "money") {
    game.endConditionType = "money";
    waitingRoom.numMoneySelectElement.style.display = "block";
    waitingRoom.numRoundsSelectElement.style.display = "none";
    socket.emit("change end condition", {
      roomId,
      endConditionType: game.endConditionType,
      endConditionRounds: game.endConditionRounds,
      endConditionMoney: game.endConditionMoney,
    });
  }
});

// Someone changes the number of rounds for end condition
waitingRoom.numRoundsSelectElement.addEventListener("change", function () {
  console.log("changing number of rounds");
  game.endConditionRounds = waitingRoom.numRoundsSelectElement.value;
  socket.emit("change end condition", {
    roomId,
    endConditionType: game.endConditionType,
    endConditionRounds: game.endConditionRounds,
    endConditionMoney: game.endConditionMoney,
  });
});

// Someone changes the amount of money for end condition
waitingRoom.numMoneySelectElement.addEventListener("change", function () {
  console.log("changing amount of money");
  game.endConditionMoney = waitingRoom.numMoneySelectElement.value;
  socket.emit("change end condition", {
    roomId,
    endConditionType: game.endConditionType,
    endConditionRounds: game.endConditionRounds,
    endConditionMoney: game.endConditionMoney,
  });
});

// Someone presses start game
waitingRoom.startGameButtonElement.addEventListener("click", game.startGame);

// SOCKET.IO
// Server queries player for room id upon joining
socket.on("room query", function () {
  socket.emit("room reply", roomId);
});

// Player is assigned a default name
socket.on("assign name", function (defaultName, assignedId, assignedColor) {
  const nameOptionsElement = document.getElementById("player-name-options");
  userName = defaultName;
  waitingRoom.updateName(userName);
  userId = assignedId;
  nameOptionsElement.classList.remove("red", "blue", "purple", "green");
  nameOptionsElement.classList.add(assignedColor);
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
    const playerElementText = document.createElement("span");
    const playerImage = document.createElement("img");
    playerElementText.textContent = user.name;
    playerImage.alt = "A wrench icon";
    playerImage.src = "/images/wrench-" + user.color + ".png";
    playerElement.appendChild(playerImage);
    playerElement.appendChild(playerElementText);
    joinedPlayersElement.appendChild(playerElement);
    if (playerElementText.offsetWidth > 130) {
      playerElementText.classList.add("squish");
    }
  }
});

// Server updates the game's end condition
socket.on("change end condition", function (data) {
  game.endConditionType = data.endConditionType;
  game.endConditionRounds = data.endConditionRounds;
  game.endConditionMoney = data.endConditionMoney;

  if (game.endConditionType === "rounds") {
    waitingRoom.playMoneyRadioElement.checked = false;
    waitingRoom.playRoundsRadioElement.checked = true;
    waitingRoom.numRoundsSelectElement.value = game.endConditionRounds;
    waitingRoom.numMoneySelectElement.value = game.endConditionMoney;
    waitingRoom.numRoundsSelectElement.style.display = "block";
    waitingRoom.numMoneySelectElement.style.display = "none";
  } else if (game.endConditionType === "money") {
    waitingRoom.playRoundsRadioElement.checked = false;
    waitingRoom.playMoneyRadioElement.checked = true;
    waitingRoom.numRoundsSelectElement.value = game.endConditionRounds;
    waitingRoom.numMoneySelectElement.value = game.endConditionMoney;
    waitingRoom.numMoneySelectElement.style.display = "block";
    waitingRoom.numRoundsSelectElement.style.display = "none";
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
