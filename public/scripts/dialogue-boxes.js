// VARIABLES
const dialogueBoxElement = document.getElementById("dialogue-box");
const rollXButtonElement = document.getElementById("roll-x");
const allRollXButtonElements = document.querySelectorAll(".all-roll-x");
let numDie = 0;
let isDieRolled = false;

// FUNCTIONS
function rollDice(numDie) {
  return Math.floor(Math.random() * numDie + 1);
}

// function openDialogue(dialogueId) {
//   const activeDialogue = document.getElementById(dialogueId);
//   activeDialogue.style.display = "block";
// }

const dialogue = {
  openRollDice: function (numSides) {
    isDieRolled = false;
    // Define Variables
    const rollDiceElement = document.getElementById("roll-dice");
    const dieSidesElement = document.getElementById("die-sides");
    // Display appropriate elements
    dialogueBoxElement.style.display = "block";
    rollDiceElement.style.display = "block";
    numDie = numSides;
    dieSidesElement.textContent = numDie;
  },

  openAllRollDice: function (numSides = 4) {
    isDieRolled = false;
    // Define Variables
    const allRollDiceElement = document.getElementById("all-roll-dice");
    const dieSidesElement =
      document.querySelectorAll(".all-die-sides")[userIndex];
    const rollPlayerEntryElements =
      document.querySelectorAll(".roll-player-entry");
    const playerNameElements = document.querySelectorAll(".all-player-name");
    // Display appropriate elements
    dialogueBoxElement.style.display = "block";
    allRollDiceElement.style.display = "block";
    for (let i = 0; i < userList.length; i++) {
      playerNameElements[i].textContent = userList[i].name;
      rollPlayerEntryElements[i].style.display = "flex";
    }
    numDie = numSides;
    dieSidesElement.textContent = numDie;
    allRollXButtonElements[userIndex].style.display = "block";
  },

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
    allRollXButtonElements[userIndex].style.display = "none";
    tieMessageElement.style.display = "none";
    rollPlayersListElement.style.display = "flex";
  },
};

// EVENT LISTENERS
rollXButtonElement.addEventListener("click", function () {
  if (!isDieRolled) {
    const rollResultElement = document.getElementById("roll-result");
    const rollResultNumberElement = document.querySelector("#roll-result span");
    rollResultNumberElement.textContent = rollDice(numDie);
    isDieRolled = true;
    rollXButtonElement.classList.add("disabled");
    rollResultElement.style.display = "block";
  }
});

// userIndex not yet defined so add event listener to all buttons
allRollXButtonElements.forEach((button) => {
  button.addEventListener("click", function () {
    let rollResult;
    if (!isDieRolled) {
      // const rollResultElement =
      // document.querySelectorAll(".all-roll-result")[userIndex];
      rollResult = rollDice(numDie);
      socket.emit("all roll", { roomId, userIndex, rollResult });
      // rollResultElement.textContent = rollResult;
      isDieRolled = true;
      allRollXButtonElements[userIndex].classList.add("disabled");
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
      allRollXButtonElements[userIndex].classList.remove("disabled");
      isDieRolled = false;
    }
  }
});

socket.on("all roll complete", function (rankArray) {
  game.reorderPlayers(rankArray);
  dialogue.showRollOrder();
});
