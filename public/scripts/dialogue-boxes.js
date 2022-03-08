// Dice Rolls, Card Draws, etc.

const dialogue = {
  // PROPERTIES
  dialogueBox: document.getElementById("dialogue-box"),
  rollXButton: document.getElementById("roll-x"),
  allRollXButtons: document.querySelectorAll(".all-roll-x"),
  numDie: 0,
  isDieRolled: false,

  // METHODS
  randomInt: function (intVal) {
    return Math.floor(Math.random() * intVal + 1);
  },

  openRollDice: function (numSides) {
    dialogue.isDieRolled = false;
    // Define Variables
    const rollDiceElement = document.getElementById("roll-dice");
    const dieSidesElement = document.getElementById("die-sides");
    // Display appropriate elements
    dialogue.dialogueBox.style.display = "block";
    rollDiceElement.style.display = "block";
    dialogue.numDie = numSides;
    dieSidesElement.textContent = dialogue.numDie;
  },

  openAllRollDice: function (numSides = 12) {
    dialogue.isDieRolled = false;
    // Define Variables
    const allRollDiceElement = document.getElementById("all-roll-dice");
    const dieSidesElement =
      document.querySelectorAll(".all-die-sides")[userIndex];
    const rollPlayerEntryElements =
      document.querySelectorAll(".roll-player-entry");
    const playerNameElements = document.querySelectorAll(".all-player-name");
    // Display appropriate elements
    dialogue.dialogueBox.style.display = "block";
    allRollDiceElement.style.display = "block";
    for (let i = 0; i < userList.length; i++) {
      playerNameElements[i].textContent = userList[i].name;
      rollPlayerEntryElements[i].style.display = "flex";
    }
    dialogue.numDie = numSides;
    dieSidesElement.textContent = dialogue.numDie;
    dialogue.allRollXButtons[userIndex].style.display = "block";
  },

  // closeAllRollDice: function () {

  // },

  showRollOrder: function () {
    // Define Variables
    const rollPlayersListElement = document.getElementById("roll-players-list");
    const playerNameElements = document.querySelectorAll(".all-player-name");
    const playerOrderElements = document.querySelectorAll(".player-order");
    const rollResultElements = document.querySelectorAll(".all-roll-result");
    const tieMessageElement = document.getElementById("tie-message");
    // Hide Players
    rollPlayersListElement.style.display = "none";
    // Reorder players and prep rankings
    for (let i = 0; i < userList.length; i++) {
      playerNameElements[i].textContent = userList[i].name;
      rollResultElements[i].style.display = "none";
      playerOrderElements[i].style.display = "block";
    }
    // Display players with rankings
    dialogue.allRollXButtons[userIndex].style.display = "none";
    tieMessageElement.style.display = "none";
    rollPlayersListElement.style.display = "flex";
  },
};

// EVENT LISTENERS
dialogue.rollXButton.addEventListener("click", function () {
  if (!dialogue.isDieRolled) {
    const rollResultElement = document.getElementById("roll-result");
    const rollResultNumberElement = document.querySelector("#roll-result span");
    rollResultNumberElement.textContent = dialogue.randomInt(dialogue.numDie);
    dialogue.isDieRolled = true;
    dialogue.rollXButton.classList.add("disabled");
    rollResultElement.style.display = "block";
  }
});

// userIndex not yet defined so add event listener to all buttons
dialogue.allRollXButtons.forEach((button) => {
  button.addEventListener("click", function () {
    let rollResult;
    if (!dialogue.isDieRolled) {
      // const rollResultElement =
      // document.querySelectorAll(".all-roll-result")[userIndex];
      rollResult = dialogue.randomInt(dialogue.numDie);
      socket.emit("all roll", { roomId, userIndex, rollResult });
      // rollResultElement.textContent = rollResult;
      dialogue.isDieRolled = true;
      dialogue.allRollXButtons[userIndex].classList.add("disabled");
    }
  });
});

// SOCKET.IO
// A user completes their beginning of round dice roll
socket.on("all roll result", function (data) {
  const rollResultElements = document.querySelectorAll(".all-roll-result");
  rollResultElements[data.userIndex].textContent = data.rollResult;
});

// Players are prompted for a re-roll                                       ADD a message that says, "X and X tied for Xth"
socket.on("reroll", function (data) {
  const rollResultElements = document.querySelectorAll(".all-roll-result");
  const tieMessageElement = document.getElementById("tie-message");
  tieMessageElement.textContent = data.tieString;
  tieMessageElement.style.display = "block";
  for (const playerIndex of data.playerIndices) {
    rollResultElements[playerIndex].textContent = "Reroll!";
    if (playerIndex === userIndex) {
      console.log("I need to re-roll!");
      dialogue.allRollXButtons[userIndex].classList.remove("disabled");
      dialogue.isDieRolled = false;
    }
  }
});

socket.on("all roll complete", function (rankArray) {
  game.reorderPlayers(rankArray);
  dialogue.showRollOrder();
  setTimeout(game.startRound, 500);
});
