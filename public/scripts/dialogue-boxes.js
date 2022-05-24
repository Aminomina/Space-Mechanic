// Dice Rolls, Card Draws, etc.

const dialogue = {
  // PROPERTIES
  dialogueBox: document.getElementById("dialogue-box"),
  backdropElement: document.getElementById("backdrop"),
  closeWindowElement: document.getElementById("dialogue-box-close"),
  upArrowElement: document.getElementById("dialogue-box-up"),
  downArrowElement: document.getElementById("dialogue-box-down"),
  rollXButton: document.getElementById("roll-x"),
  allRollXButtons: document.querySelectorAll(".all-roll-x"),
  numDie: 0,
  isDieRolled: false,
  activeJobs: [],
  rollResult: undefined,

  // METHODS
  randomInt: function (intVal) {
    return Math.floor(Math.random() * intVal + 1);
  },

  openEndOfRoundDisplay: function (moneyOrder, rankArray) {
    dialogue.closeDialogueBox();
    // Definte Variables
    const endOfRoundDisplayElement = document.getElementById("end-of-round");
    const playerEntryElements = document.querySelectorAll(".rank-player-entry");
    const playerRankElements = document.querySelectorAll(".rank-player-rank");
    const playerNameIcons = document.querySelectorAll(".rank-player-name img");
    const playerNameElements = document.querySelectorAll(
      ".rank-player-name span"
    );
    const playerMoneyElements = document.querySelectorAll(
      ".rank-player-money span"
    );
    // Update Values
    for (let i = 0; i < userList.length; i++) {
      const money = userList[moneyOrder[i]].money.toFixed(2);
      playerEntryElements[i].style.display = "block";
      playerEntryElements[i].classList.remove("red", "blue", "purple", "green");
      playerEntryElements[i].classList.add(userList[moneyOrder[i]].color);
      playerRankElements[i].textContent = rankArray[i];
      playerNameElements[i].textContent = userList[moneyOrder[i]].name;
      playerMoneyElements[i].textContent = money;
      playerNameIcons[i].src =
        "/images/icons/wrench-" + userList[moneyOrder[i]].color + "-small.png";
    }

    // Set dialogue window to correct size
    dialogue.dialogueBox.className = "end-of-round";

    // Display appropriate elements
    dialogue.dialogueBox.style.display = "block";
    endOfRoundDisplayElement.style.display = "flex";
    dialogue.backdropElement.style.display = "block";

    setTimeout(dialogue.openAllRollDice, 5000);
  },

  openEndGameDisplay: function (moneyOrder, rankArray) {
    dialogue.closeDialogueBox();
    // Define Variables
    const endGameDisplayElement = document.getElementById("end-game");
    const winnerMessageElement = document.getElementById("winner-message");
    const playerEntryElements = document.querySelectorAll(".end-player-entry");
    const playerRankElements = document.querySelectorAll(".end-player-rank");
    const playerNameIcons = document.querySelectorAll(".end-player-name img");
    const playerNameElements = document.querySelectorAll(
      ".end-player-name span"
    );
    const playerMoneyElements = document.querySelectorAll(
      ".end-player-money span"
    );
    let isAlreadyWinner = false;
    let winners = [];

    // Update Values
    for (let i = 0; i < userList.length; i++) {
      const money = userList[moneyOrder[i]].money.toFixed(2);
      playerEntryElements[i].style.display = "block";
      playerEntryElements[i].classList.remove("red", "blue", "purple", "green");
      playerEntryElements[i].classList.add(userList[moneyOrder[i]].color);
      playerRankElements[i].textContent = rankArray[i];
      playerNameElements[i].textContent = userList[moneyOrder[i]].name;
      playerMoneyElements[i].textContent = money;
      playerNameIcons[i].src =
        "/images/icons/wrench-" + userList[moneyOrder[i]].color + "-small.png";
      // Check if winner
      if (rankArray[i] === 1) {
        winners.push(userList[i].name);
      }
    }

    winnerMessageElement.textContent = "";
    if (winners.length === 1) {
      winnerMessageElement.textContent = `${winners[0]} wins!`;
    } else if (winners.length === 2) {
      winnerMessageElement = `${winners[0]} and ${winners[1]} win!`;
    } else {
      for (let i = 0; i < winners.length - 1; i++) {
        winnerMessageElement.textContent += `${winners[0]}, `;
      }
      winnerMessageElement.textContent += `and ${
        winners[winners.length - 1]
      } win!`;
    }

    // Set dialogue window to correct size
    dialogue.dialogueBox.className = "end-of-round";

    // Display appropriate elements
    dialogue.dialogueBox.style.display = "block";
    endGameDisplayElement.style.display = "flex";
    dialogue.backdropElement.style.display = "block";

    // Request reset
    setTimeout(game.requestResetGame, 5000);
  },

  resetEndGameDisplay: function () {
    // Define Variables
    const winnerMessageElement = document.getElementById("winner-message");
    const playerEntryElements = document.querySelectorAll(".end-player-entry");
    const playerRankElements = document.querySelectorAll(".end-player-rank");
    const playerNameIcons = document.querySelectorAll(".end-player-name img");
    const playerNameElements = document.querySelectorAll(
      ".end-player-name span"
    );
    const playerMoneyElements = document.querySelectorAll(
      ".end-player-money span"
    );

    // Update Values
    for (let i = 0; i < 4; i++) {
      playerEntryElements[i].style.display = "none";
      playerEntryElements[i].classList.remove("red", "blue", "purple", "green");
      playerRankElements[i].textContent = "X";
      playerNameElements[i].textContent = "Player X";
      playerMoneyElements[i].textContent = "0";
      playerNameIcons[i].src = "/images/icons/wrench-red.png";
      winnerMessageElement.textContent = "X Wins!";
    }
  },

  openRollDice: function (numSides) {
    dialogue.closeDialogueBox();
    dialogue.isDieRolled = false;
    // Define Variables
    const rollDiceElement = document.getElementById("roll-dice");
    const rollHeadingElement = document.getElementById("roll-dice-heading");
    const dieSidesElement = document.getElementById("die-sides");
    const rollResultElement = document.getElementById("roll-result");
    const rollMessageElement = document.getElementById("roll-message");
    // Reset any modified values
    rollHeadingElement.textContent = "Roll the Dice!";
    dialogue.rollXButton.classList.remove("disabled");
    rollResultElement.textContent = "?";
    rollMessageElement.textContent = "";
    rollMessageElement.style.display = "none";
    // Display appropriate elements
    dialogue.dialogueBox.style.display = "block";
    rollDiceElement.style.display = "flex";
    dialogue.numDie = numSides;
    dieSidesElement.textContent = dialogue.numDie;
    dialogue.backdropElement.style.display = "block";
  },

  openAllRollDice: function (numSides = 12) {
    dialogue.closeDialogueBox();
    dialogue.isDieRolled = false;
    // Define Variables
    const allRollDiceElement = document.getElementById("all-roll-dice");
    const dieSidesElement =
      document.querySelectorAll(".all-die-sides")[userIndex];
    const rollPlayerEntryElements =
      document.querySelectorAll(".roll-player-entry");
    const playerNameElements = document.querySelectorAll(".all-player-name");
    const rollPlayersListElement = document.getElementById("roll-players-list");
    const playerOrderElements = document.querySelectorAll(".player-order");
    const rollResultElements = document.querySelectorAll(".all-roll-result");

    // Reset values
    for (let i = 0; i < userList.length; i++) {
      playerNameElements[i].textContent = userList[i].name;
      rollResultElements[i].textContent = "?";
      rollResultElements[i].style.display = "block";
      playerOrderElements[i].style.display = "none";
      playerNameElements[i].classList.remove("squish");
    }

    dialogue.allRollXButtons[userIndex].classList.remove("disabled");

    // Display appropriate elements
    dialogue.dialogueBox.style.display = "block";
    allRollDiceElement.style.display = "block";
    for (let i = 0; i < userList.length; i++) {
      playerNameElements[i].textContent = userList[i].name;
      rollPlayerEntryElements[i].style.display = "flex";
      if (rollPlayerEntryElements[i].offsetWidth > 170) {
        playerNameElements[i].classList.add("squish");
      }
    }
    dialogue.numDie = numSides;
    dieSidesElement.textContent = dialogue.numDie;
    dialogue.allRollXButtons[userIndex].style.display = "block";
    dialogue.backdropElement.style.display = "block";
  },

  resetAllRollDice: function () {
    // Define Variables
    const rollPlayerEntryElements =
      document.querySelectorAll(".roll-player-entry");
    const playerNameElements = document.querySelectorAll(".all-player-name");
    const playerOrderElements = document.querySelectorAll(".player-order");
    const rollResultElements = document.querySelectorAll(".all-roll-result");

    // Reset values
    for (let i = 0; i < 4; i++) {
      rollPlayerEntryElements[i].style.display = "none";
      playerNameElements[i].textContent = "Player X";
      rollResultElements[i].textContent = "?";
      rollResultElements[i].style.display = "block";
      playerOrderElements[i].style.display = "none";
      playerNameElements[i].classList.remove("squish");
    }
  },

  reroll: function (tieString, playerIndices) {
    const rollResultElements = document.querySelectorAll(".all-roll-result");
    const tieMessageElement = document.getElementById("tie-message");
    tieMessageElement.textContent = tieString;
    tieMessageElement.style.display = "block";
    for (const playerIndex of playerIndices) {
      rollResultElements[playerIndex].textContent = "Reroll!";
      if (playerIndex === userIndex) {
        console.log("I need to re-roll!");
        dialogue.allRollXButtons[userIndex].classList.remove("disabled");
        dialogue.isDieRolled = false;
      }
    }
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
      playerNameElements[i].textContent = userList[game.order[i]].name;
      rollResultElements[i].style.display = "none";
      playerOrderElements[i].style.display = "block";
    }
    // Display players with rankings
    dialogue.allRollXButtons[userIndex].style.display = "none";
    tieMessageElement.style.display = "none";
    rollPlayersListElement.style.display = "flex";
  },

  openJobDetail: function (event) {
    dialogue.closeDialogueBox();
    // Define Variables
    const jobDetailElement = document.getElementById("job-detail");
    const planetNameElement = document.getElementById("job-detail-planet");
    const systemNameElement = document.getElementById("job-detail-system");
    const planetStatsElements = document.querySelectorAll(
      "#job-detail-stats span"
    );
    const planetDescriptionElement = document.getElementById(
      "job-detail-description"
    );
    const difficultyDescriptionElement = document.getElementById(
      "job-detail-difficulty-description"
    );
    const hazardDescriptionElement = document.getElementById(
      "job-detail-hazard-description"
    );

    let jobIndices =
      event.target.parentElement.parentElement.children[2].textContent;
    dialogue.activeJobs = [];
    // Fetch jobs
    if (typeof jobIndices === "number") {
      // One job
      dialogue.activeJobs.push(game.jobsArray[jobIndices]);
    } else {
      // Multiple jobs
      jobIndices = jobIndices.split(",");
      for (const index of jobIndices) {
        dialogue.activeJobs.push(game.jobsArray[index]);
      }
    }

    // Change appropriate values
    planetNameElement.textContent = dialogue.activeJobs[0].name;
    systemNameElement.textContent = dialogue.activeJobs[0].system;
    if (parseFloat(dialogue.activeJobs[0].difficulty) > 0) {
      planetStatsElements[0].textContent =
        "+" + dialogue.activeJobs[0].difficulty + "x Difficulty";
      planetStatsElements[0].style.display = "block";
    } else if (parseFloat(dialogue.activeJobs[0].difficulty) < 0) {
      planetStatsElements[0].textContent =
        dialogue.activeJobs[0].difficulty + "x Difficulty";
      planetStatsElements[0].style.display = "block";
    } else {
      planetStatsElements[0].textContent = "";
      planetStatsElements[0].style.display = "none";
    }
    planetStatsElements[1].textContent =
      "Base Reward: $" + dialogue.activeJobs[0]["base-reward"];
    if ("hazard-pay" in dialogue.activeJobs[0]) {
      planetStatsElements[2].textContent =
        "Hazard Pay: $" + dialogue.activeJobs[0]["hazard-pay"] + "/Day";
      planetStatsElements[2].style.display = "block";
    } else {
      planetStatsElements[2].textContent = "";
      planetStatsElements[2].style.display = "none";
    }
    planetDescriptionElement.textContent = dialogue.activeJobs[0].description;
    if ("difficulty-description" in dialogue.activeJobs[0]) {
      difficultyDescriptionElement.textContent =
        dialogue.activeJobs[0]["difficulty-description"];
      difficultyDescriptionElement.style.display = "block";
    } else {
      difficultyDescriptionElement.textContent = "";
      difficultyDescriptionElement.style.display = "none";
    }
    if ("hazard-description" in dialogue.activeJobs[0]) {
      hazardDescriptionElement.textContent =
        dialogue.activeJobs[0]["hazard-description"];
      hazardDescriptionElement.style.display = "block";
    } else {
      hazardDescriptionElement.textContent = "";
      hazardDescriptionElement.style.display = "none";
    }

    dialogue.loadJobDetails(dialogue.activeJobs);
    // Hide any elements that may be open from before
    for (const sectionElement of dialogue.dialogueBox.children) {
      sectionElement.style.display = "none";
    }

    // Display appropriate elements
    dialogue.showDialogueControls();
    dialogue.dialogueBox.style.display = "block";
    jobDetailElement.style.display = "block";
    dialogue.backdropElement.style.display = "block";

    // Set dialogue window to correct size
    dialogue.dialogueBox.className = "job-detail";

    // Scroll to the top
    jobDetailElement.scrollTo(0, 0);

    // Add Event Listeners
    dialogue.closeWindowElement.addEventListener(
      "click",
      dialogue.closeDialogueBox
    );
    dialogue.backdropElement.addEventListener(
      "click",
      dialogue.closeDialogueBox
    );
    dialogue.upArrowElement.addEventListener("click", dialogue.scrollUp);
    dialogue.downArrowElement.addEventListener("click", dialogue.scrollDown);
  },

  closeDialogueBox: function () {
    for (const sectionElement of dialogue.dialogueBox.children) {
      sectionElement.style.display = "none";
    }
    dialogue.dialogueBox.style.display = "none";
    dialogue.backdropElement.style.display = "none";
    dialogue.dialogueBox.className = "";

    dialogue.closeWindowElement.removeEventListener(
      "click",
      dialogue.closeDialogueBox
    );
    dialogue.backdropElement.removeEventListener(
      "click",
      dialogue.closeDialogueBox
    );
    dialogue.upArrowElement.removeEventListener("click", dialogue.scrollUp);
    dialogue.downArrowElement.removeEventListener("click", dialogue.scrollDown);
  },

  showDialogueControls: function (close = true, upDown = true) {
    const controlsElement = dialogue.dialogueBox.children[0];
    controlsElement.style.display = "block";
    if (close === true) {
      controlsElement.children[0].style.display = "block";
    } else {
      controlsElement.children[0].style.display = "none";
    }
    if (upDown === true) {
      controlsElement.children[1].style.display = "block";
      controlsElement.children[2].style.display = "block";
    } else {
      controlsElement.children[1].style.display = "none";
      controlsElement.children[2].style.display = "none";
    }
  },

  closeDialogueControls: function () {
    dialogue.dialogueBox.children[0].style.display = "none";
  },

  scrollUp: function () {
    const numDialogues = dialogue.dialogueBox.childElementCount;
    for (let i = 1; i < numDialogues; i++) {
      if (dialogue.dialogueBox.children[i].style.display !== "none") {
        dialogue.dialogueBox.children[i].scrollBy(0, -150);
      }
    }
  },

  scrollDown: function () {
    const numDialogues = dialogue.dialogueBox.childElementCount;
    for (let i = 1; i < numDialogues; i++) {
      if (dialogue.dialogueBox.children[i].style.display !== "none") {
        dialogue.dialogueBox.children[i].scrollBy(0, 150);
      }
    }
  },

  loadJobDetails: function (activeJobs) {
    const detailListElement = document.getElementById("job-detail-list");
    // Remove Any Old Entries
    while (detailListElement.firstChild) {
      detailListElement.removeChild(detailListElement.firstChild);
    }
    // Add New Entries
    for (const job of activeJobs) {
      const detailEntryTemplate = document.querySelector(
        "#templates .job-detail-entry"
      );
      const detailEntryElement = detailEntryTemplate.cloneNode(true);
      const entryContentElement = detailEntryElement.children[0];
      const entryStatsElement = entryContentElement.children[4];
      const entryButtonElement = entryContentElement.children[5];
      const entryImageSection = detailEntryElement.children[1];
      const entryImageElement = entryImageSection.children[0];
      const entryImageScreen = entryImageSection.children[1];
      const entryImageOverlay = entryImageSection.children[2];
      const location = jobData.locations[job.locIndex];
      const type = jobData.types[job.typeIndex];
      let totalDifficulty =
        1 + job.difficulty + location.difficulty + type.diffexpay;
      let totalExp = 1 + job.exp + location.exp + type.diffexpay;
      let totalReward =
        job["base-reward"] * (1 + location.pay + type.diffexpay);

      detailEntryElement.style.display = "flex";

      // Job Info
      entryContentElement.children[0].textContent = location.name;
      entryContentElement.children[1].textContent = type.name;
      entryContentElement.children[2].textContent = location.description;
      entryContentElement.children[3].textContent =
        location["difficulty-description"];

      // Job Image
      entryImageElement.src = `/images/job-detail/${job.locIndex}.png`;

      entryImageOverlay.textContent = "";
      entryImageScreen.classList.remove("claimed", "fixed");
      entryImageOverlay.classList.remove("claimed", "fixed");

      // Job is claimed
      if (job.status === 1) {
        entryImageOverlay.textContent = "CLAIMED";
        entryImageScreen.classList.add("claimed");
        entryImageOverlay.classList.add("claimed");
      }
      // Job is fixed
      else if (job.status === 2) {
        entryImageOverlay.textContent = "FIXED";
        entryImageScreen.classList.add("fixed");
        entryImageOverlay.classList.add("fixed");
      }

      // Job Stats
      if (location.name === "Satellite") {
        // Remove planet-specific roll multipliers
        totalDifficulty -= job.difficulty;
        totalExp -= job.exp;
      }
      entryStatsElement.children[0].textContent =
        "Total Difficulty: " + totalDifficulty.toFixed(2) + "x";
      entryStatsElement.children[1].textContent =
        "Total Exp: " + totalExp.toFixed(2) + "x";
      entryStatsElement.children[2].textContent =
        "Total Reward: $" + totalReward.toFixed(2);

      // Accept Job Button
      const isUserActive =
        game.isTurn && userList[userIndex].actionStatus !== 4;
      if (
        (isUserActive && job.status === 0) ||
        (isUserActive &&
          job.status === 1 &&
          userList[userIndex].currentJobIndex === job.id &&
          dashboard.turnInfo.newJobChoice >= 0 &&
          dashboard.turnInfo.newJobChoice !== job.id)
      ) {
        entryButtonElement.style.display = "block";
        entryButtonElement.addEventListener("click", dialogue.chooseJob);
      } else {
        entryButtonElement.style.display = "none";
      }

      detailListElement.appendChild(detailEntryElement);
    }
  },

  chooseJob: function (event) {
    // Define Variables
    const jobElement = event.target.parentElement.parentElement;
    const jobListElement = jobElement.parentElement;
    const jobElementIndex = Array.prototype.indexOf.call(
      jobListElement.children,
      jobElement
    );
    const jobId = dialogue.activeJobs[jobElementIndex].id;

    // Exit dialogue window, send job choice to turnInfo object
    dialogue.closeDialogueBox();

    board.clearJobLines();
    dashboard.registerJob(jobId);

    // if (jobId === userList[userIndex].currentJobIndex) {}
  },
};

// EVENT LISTENERS

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

// Players are prompted for a re-roll
socket.on("reroll", function (data) {
  setTimeout(dialogue.reroll, 1000, data.tieString, data.playerIndices);
});

// Rolls are complete
socket.on("all roll complete", function (orderArray) {
  console.log(`orderArray: ${orderArray}`);
  // game.reorderPlayers(rankArray);
  game.order = orderArray;
  setTimeout(dialogue.showRollOrder, 1000);
  setTimeout(game.startRound, 2000);
});
