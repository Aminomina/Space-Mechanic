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
    dialogue.backdropElement.style.display = "block";
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
    dialogue.allRollXButtons[userIndex].style.display = "none";
    tieMessageElement.style.display = "none";
    rollPlayersListElement.style.display = "flex";
  },

  openJobDetail: function (event) {
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
    dialogue.dialogueBox.children[0].style.display = "block"; //Dialogue box controls
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

  closeDialogueBox: function (event) {
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
    dialogue.closeWindowElement.removeEventListener(
      "click",
      dialogue.closeDialogueBox
    );
    dialogue.upArrowElement.removeEventListener("click", dialogue.scrollUp);
    dialogue.downArrowElement.removeEventListener("click", dialogue.scrollDown);
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
      const entryImageElement = detailEntryElement.children[1];
      const location = jobData.locations[job.locIndex];
      const type = jobData.types[job.typeIndex];
      let totalDifficulty =
        1 + job.difficulty + location.difficulty + type.diffexpay;
      let totalExp = 1 + job.exp + location.exp + type.diffexpay;
      let totalReward =
        job["base-reward"] * (1 + location.pay + type.diffexpay);

      detailEntryElement.style.display = "flex";

      entryContentElement.children[0].textContent = location.name;
      entryContentElement.children[1].textContent = type.name;
      entryContentElement.children[2].textContent = location.description;
      entryContentElement.children[3].textContent =
        location["difficulty-description"];

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
      if (game.isTurn) {
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

    // Mark job as claimed
    // game.jobsArray[jobId].status = 1;

    // Exit dialogue window, send job choice to server
    dialogue.closeDialogueBox();
    socket.emit("job chosen", { roomId, userIndex, jobId });
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

// Players are prompted for a re-roll
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
  console.log(rankArray);
  game.reorderPlayers(rankArray);
  dialogue.showRollOrder();
  setTimeout(game.startRound, 500);
});
