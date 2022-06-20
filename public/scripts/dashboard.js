// Properties, methods, and event listeners for dashboard section
const dashboard = {
  // PROPERTIES
  dashboardButton: document.getElementById("dashboard-button"),
  cardsButton: document.getElementById("cards-button"),
  endTurnButton: document.getElementById("end-turn"),
  rollToFixButton: document.getElementById("roll-to-fix"),
  turnInfo: {
    roomId: roomId,
    userIndex: undefined,
    newJobChoice: -1,
    jobOutcome: {},
    newUserStats: {},
    currentJobMultiplier: undefined,
    delayTransit: false,
  },
  currentJobInfo: {
    totalDiff: undefined,
    totalExp: undefined,
    totalReward: undefined,
  },
  hasRolledToFix: false,
  hazard: {},
  // METHODS
  endTurn: function () {
    console.log("ending turn");
    dashboard.endTurnButton.removeEventListener("click", dashboard.endTurn);
    dashboard.rollToFixButton.removeEventListener(
      "click",
      dashboard.openRollToFix
    );
    game.isTurn = false;
    game.hasRolledToFix = false;

    //Reset job event card draw when player is going to a new job
    if (dashboard.turnInfo.newJobChoice !== -1) {
      userList[userIndex].jobCardDrawn = false;
    }

    //Player has abandoned a job
    if (
      dashboard.turnInfo.newJobChoice !== -1 &&
      "jobId" in dashboard.turnInfo.jobOutcome &&
      dashboard.turnInfo.jobOutcome.jobId >= 0 &&
      game.jobsArray[dashboard.turnInfo.jobOutcome.jobId].status !== 2 &&
      dashboard.turnInfo.jobOutcome.status !== 2
    ) {
      console.log("abandoning job");
      dashboard.turnInfo.jobOutcome.status = 0;
    }

    // Send turn info to server
    console.log("sending turn info to server");
    socket.emit("turn end", dashboard.turnInfo);

    dashboard.updateLocationString();
    board.clearJobLines();

    // Reset turn info, but keep job outcome if user still at site
    if (userList[userIndex].actionStatus !== 2) {
      dashboard.turnInfo.jobOutcome = {};
    }
    dashboard.turnInfo.newUserStats = {};
    dashboard.turnInfo.delayTransit = false;

    // Reset single turn values
    gameCards.clearDayBonuses();

    // Disable buttons
    dashboard.endTurnButton.classList.add("disabled");
    dashboard.rollToFixButton.classList.add("disabled");
  },
  updateLocationString: function () {
    console.log("updating location string");
    const locationStringElement = document.getElementById("location-string");
    if (
      dashboard.turnInfo.newJobChoice >= 0 &&
      dashboard.turnInfo.newJobChoice !== userList[userIndex].currentJobIndex
    ) {
      locationStringElement.textContent = `You're bound for ${
        game.jobsArray[dashboard.turnInfo.newJobChoice].name
      }.`;
    } else if (userList[userIndex].actionStatus === 0) {
      locationStringElement.textContent = "You're at home base.";
    } else if (userList[userIndex].actionStatus === 1) {
      locationStringElement.textContent = `You're in transit to ${userList[userIndex].site}.`;
    } else if (userList[userIndex].actionStatus === 2) {
      if (game.jobsArray[userList[userIndex].currentJobIndex].locIndex === 6) {
        locationStringElement.textContent = `You're orbiting ${userList[userIndex].site}.`;
      } else {
        locationStringElement.textContent = `You're on ${userList[userIndex].site}.`;
      }
    } else if (
      userList[userIndex].actionStatus === 3 ||
      userList[userIndex].actionStatus === 6
    ) {
      locationStringElement.textContent = `You're in open space.`;
    } else if (userList[userIndex].actionStatus === 4) {
      locationStringElement.textContent = `You're in the hospital.`;
    } else if (userList[userIndex].actionStatus === 5) {
      locationStringElement.textContent = `You're at Space Mechanic HQ.`;
    } else if (userList[userIndex].actionStatus === 7) {
      locationStringElement.textContent = `You're on vacation.`;
    } else {
      locationStringElement.textContent = "";
    }
  },
  updateJobPreview: function () {
    console.log("updating job preview");
    const previewImageElement =
      document.getElementById("job-preview-image").children[0];
    const previewContentElement = document.getElementById(
      "job-preview-content"
    );
    const jobLocationElement = previewContentElement.children[0];
    const jobTypeElement = previewContentElement.children[1];
    const previewStatsElement = previewContentElement.children[2];
    const previewDiffElement = previewStatsElement.children[0];
    const previewExpElement = previewStatsElement.children[1];
    const previewPayElement = previewStatsElement.children[2];
    // A job is selected
    if (
      dashboard.turnInfo.newJobChoice !== -1 ||
      dashboard.turnInfo.jobOutcome.status === 1
    ) {
      let job;
      if (dashboard.turnInfo.newJobChoice !== -1) {
        job = game.jobsArray[dashboard.turnInfo.newJobChoice];
      } else if (dashboard.turnInfo.jobOutcome.status === 1) {
        job = game.jobsArray[dashboard.turnInfo.jobOutcome.jobId];
      }
      // Update elements
      previewImageElement.src = `/images/job-detail/${job.locIndex}.png`;
      jobLocationElement.textContent = jobData.locations[job.locIndex].name;
      jobTypeElement.textContent = jobData.types[job.typeIndex].name;
      previewDiffElement.innerHTML = `Difficulty:<br>${dashboard.currentJobInfo.totalDiff.toFixed(
        2
      )}x`;
      previewExpElement.innerHTML = `Exp:<br>${dashboard.currentJobInfo.totalExp.toFixed(
        2
      )}x`;
      previewPayElement.innerHTML = `Reward:<br>$${dashboard.currentJobInfo.totalReward.toFixed(
        2
      )}`;
      // Make appropriate elements visible
      previewStatsElement.style.display = "flex";
    }
    // A job is not selected
    else {
      // Update elements
      previewImageElement.src = `/images/job-detail/placeholder.jpg`;
      jobLocationElement.textContent = "No Job Selected";
      jobTypeElement.innerHTML = "Select a job<br>from the board";
      previewDiffElement.innerHTML = "X";
      previewExpElement.innerHTML = "X";
      previewPayElement.innerHTML = "X";
      // Hide appropriate elements
      previewStatsElement.style.display = "none";
    }
  },
  updatePlayerPreview: function () {
    console.log("updating player preview");
    // Variables
    const nameIconElement =
      document.getElementById("dash-player-name").children[0];
    const nameElement = document.getElementById("dash-player-name").children[1];
    const moneyElement =
      document.getElementById("dash-player-money").children[1];
    const expElement = document.getElementById("dash-player-exp").children[1];

    // Update Values
    nameIconElement.src =
      "/images/icons/wrench-" + userList[userIndex].color + "-small.png";
    nameElement.textContent = userList[userIndex].name;
    moneyElement.textContent = (+userList[userIndex].money).toFixed(2);
    expElement.textContent = (+userList[userIndex].exp).toFixed(0);
  },
  registerJob: function (jobId) {
    console.log("registering job");
    // Variables
    const job = game.jobsArray[jobId];
    const location = jobData.locations[job.locIndex];
    const type = jobData.types[job.typeIndex];
    const exp = userList[userIndex].exp;

    // Store job stats
    dashboard.currentJobInfo.totalDiff =
      1 + job.difficulty + location.difficulty + type.diffexpay;
    dashboard.currentJobInfo.totalExp =
      1 + job.exp + location.exp + type.diffexpay;
    dashboard.currentJobInfo.totalReward =
      job["base-reward"] * (1 + location.pay + type.diffexpay);

    // Calculate total job multiplier
    const bonusDiff =
      userList[userIndex].bonusDiff.day +
      userList[userIndex].bonusDiff.week +
      userList[userIndex].bonusDiff.hold;
    const bonusExp =
      userList[userIndex].bonusExp.day +
      userList[userIndex].bonusExp.week +
      userList[userIndex].bonusExp.hold;
    const kExp = 2 - 0.999 ** exp + bonusExp;
    const kDiff = dashboard.currentJobInfo.totalDiff + bonusDiff;
    dashboard.currentJobMultiplier = kExp / kDiff;

    dashboard.turnInfo.newJobChoice = jobId;
    const distance = board.distanceBetween(
      userList[userIndex].coordinates,
      game.jobsArray[jobId].coordinates
    );
    if (distance === 0) {
      const oldJobId = userList[userIndex].currentJobIndex;
      // Hopping to another job in system
      // board.clearJobLines();
      console.log("hopping to another job");
      socket.emit("update player job", {
        roomId,
        userIndex,
        jobId,
        oldJobId,
      });
      // dialogue.closeDialogueBox();
      // dashboard.turnInfo.newJobChoice = jobId;
      // Check if old job had hazard
      let isOldJobHazard;
      if (oldJobId >= 0) {
        isOldJobHazard =
          game.jobsArray[oldJobId]["hazard-type"] !== 0 &&
          game.jobsArray[oldJobId].locIndex !== 6;
      } else {
        isOldJobHazard = false;
      }

      const isNewJobHazard =
        game.jobsArray[jobId]["hazard-type"] !== 0 &&
        game.jobsArray[jobId].locIndex !== 6;
      if (
        (isNewJobHazard && !isOldJobHazard) ||
        (isNewJobHazard &&
          game.jobsArray[jobId].name !== game.jobsArray[oldJobId].name)
      ) {
        dashboard.openRollForHazard({
          type: game.jobsArray[jobId]["hazard-type"],
          string: game.jobsArray[jobId]["hazard-roll-string"],
          pay: game.jobsArray[jobId]["hazard-pay"],
        });
      }

      // Enable roll-to-fix if not already used that turn
      if (!game.hasRolledToFix) {
        dashboard.rollToFixButton.classList.remove("disabled");
        dashboard.rollToFixButton.addEventListener(
          "click",
          dashboard.openRollToFix
        );
      } else {
        dashboard.rollToFixButton.classList.add("disabled");
        dashboard.rollToFixButton.removeEventListener(
          "click",
          dashboard.openRollToFix
        );
      }
    } else {
      // Job is out of system
      board.drawJobLine(
        userList[userIndex].boardCoordinates,
        game.jobsArray[jobId].coordinates,
        distance
      );
      dialogue.closeDialogueBox();
      // dashboard.turnInfo.newJobChoice = jobId;

      // Disable roll-to-fix
      dashboard.rollToFixButton.classList.add("disabled");
      dashboard.rollToFixButton.removeEventListener(
        "click",
        dashboard.openRollToFix
      );
    }

    // Update job preview and location string to registered job
    dashboard.updateLocationString();
    dashboard.updateJobPreview();
  },
  deregisterJob: function () {
    console.log("deregistering job");
    dashboard.turnInfo.newJobChoice = -1;
    dashboard.updateJobPreview();
    dashboard.updateLocationString();
  },
  checkForHazard: function () {
    const currentJobIndex = userList[userIndex].currentJobIndex;
    const currentJob = game.jobsArray[currentJobIndex];
    let isProtected = false;

    // Check if user has hazard protection
    if (
      currentJob != undefined &&
      "hazard-type" in currentJob &&
      ((userList[userIndex].protections.accidents &&
        (currentJob["hazard-type"] === 10 ||
          currentJob["hazard-type"] === 15)) ||
        (userList[userIndex].protections.cryptids &&
          currentJob["hazard-type"] === 11) ||
        (userList[userIndex].protections.nonCryptids &&
          currentJob["hazard-type"] === 21))
    ) {
      isProtected = true;
    }

    // Check if user must roll for hazards
    if (
      // Player is on a planet with a hazard
      currentJob != undefined &&
      "hazard-type" in currentJob &&
      currentJob["hazard-type"] != 0 &&
      // Player is not protected
      !isProtected &&
      // The current job is not fixed
      currentJob.status !== 2 &&
      // Player is on planet (not in orbit)
      currentJob.locIndex != 6
    ) {
      dashboard.openRollForHazard({
        type: currentJob["hazard-type"],
        string: currentJob["hazard-roll-string"],
        pay: currentJob["hazard-pay"],
      });
    }
  },
  sendToHospital: function () {
    // Player spends rest of week in hospital
    // Abandon job
    console.log("abandoning job");
    board.clearJobLines();
    dashboard.turnInfo.jobOutcome = {
      jobId: userList[userIndex].currentJobIndex,
      status: 0,
    };
    dashboard.turnInfo.newJobChoice = -1;

    // Deactivate roll-to-fix
    dashboard.rollToFixButton.classList.add("disabled");
    dashboard.rollToFixButton.removeEventListener(
      "click",
      dashboard.openRollToFix
    );

    // Update player status
    socket.emit("update player status", {
      roomId: roomId,
      userIndex: userIndex,
      actionStatus: 4,
    });
  },
  openRollForHazard: function (hazard) {
    console.log("opening roll for hazard");
    const rollHeadingElement = document.getElementById("roll-dice-heading");
    const rollMessageElement = document.getElementById("roll-message");
    const options = document.getElementById("roll-options");
    if (+hazard.type < 15) {
      dialogue.openRollDice(6);
    } else if (+hazard.type < 20) {
      dialogue.openRollDice(3);
    } else if (+hazard.type < 25) {
      dialogue.openRollDice(9);
    } else if (+hazard.type < 30) {
      dialogue.openRollDice(4);
    } else if (+hazard.type < 40) {
      dialogue.openRollDice(12);
    }

    rollHeadingElement.textContent = `Roll for ${hazard.string}!`;
    rollMessageElement.textContent = "Don't roll a 1!";
    rollMessageElement.style.display = "block";
    options.style.display = "none";
    dashboard.hazard = { ...hazard };
    dialogue.rollXButton.addEventListener("click", dashboard.rollForHazard);
  },
  rollForHazard: function () {
    console.log("client rolling for hazard");
    // Variables
    const rollResultElement = document.getElementById("roll-result");
    const rollMessageElement = document.getElementById("roll-message");
    const options = document.getElementById("roll-options");
    const optionButtonA = document.getElementById("roll-option-a");
    const optionButtonB = document.getElementById("roll-option-b");

    dialogue.rollResult = dialogue.randomInt(dialogue.numDie);
    rollResultElement.textContent = dialogue.rollResult;

    // Disable button
    dialogue.rollXButton.classList.add("disabled");

    // Remove event listeners
    dialogue.rollXButton.removeEventListener("click", dashboard.rollForHazard);

    // Manage roll success or failure
    if (dialogue.rollResult >= 2) {
      console.log("player avoided hazard");

      // Display roll text
      rollMessageElement.textContent = `You avoided ${dashboard.hazard.string}!`;
      rollMessageElement.style.display = "block";

      // Get hazard pay
      const newMoney = +userList[userIndex].money + +dashboard.hazard.pay;
      console.log(newMoney);
      // Update player stats
      socket.emit("update player stats", {
        roomId,
        userIndex,
        newUserStats: { money: newMoney },
      });
    } else {
      console.log("player caught by hazard");

      // Caught by Assailants
      if (dashboard.hazard.type % 5 === 1) {
        rollMessageElement.textContent = `Oh no! You got caught by ${dashboard.hazard.string}!`;
        rollMessageElement.style.display = "block";
        // Check if user has smoke bomb
        if (userList[userIndex].cards.includes(16)) {
          console.log("may use smoke bomb");
          options.children[0].textContent = "Escape using smoke bomb?";
          optionButtonA.textContent = "Yes";
          optionButtonB.textContent = "No";
          optionButtonA.className = "";
          optionButtonB.className = "";
          options.style.display = "flex";
          optionButtonA.addEventListener("click", dashboard.assailantSmokeBomb);
          optionButtonB.addEventListener("click", dashboard.assailantCaught);
        } else {
          dashboard.assailantCaught();
        }
        return;
      }
      // Caught in natural disaster
      else if (dashboard.hazard.type === 30) {
        rollMessageElement.textContent = `Oh no! You got caught in the ${dashboard.hazard.string}!`;
      }
      // Caught by other hazard
      else {
        rollMessageElement.textContent = `Oh no! You fell victim to ${dashboard.hazard.string}!`;
      }
      rollMessageElement.style.display = "block";

      // Injury
      if (dashboard.hazard.type < 20) {
        dashboard.sendToHospital();
      }
      // Loss of money
      else if (dashboard.hazard.type < 30) {
        dashboard.addMoney(-300);
      }
      // Natural Disaster
      else if (dashboard.hazard.type < 40) {
        dashboard.sendToHospital();
      }
    }

    // Close window after delay
    setTimeout(dialogue.closeDialogueBox, 2000);
  },

  assailantSmokeBomb: function () {
    console.log("escaping with smoke bomb!");
    const options = document.getElementById("roll-options");
    const optionButtonA = document.getElementById("roll-option-a");
    const optionButtonB = document.getElementById("roll-option-b");

    // Remove Event Listeners
    optionButtonA.removeEventListener("click", dashboard.assailantSmokeBomb);
    optionButtonB.removeEventListener("click", dashboard.assailantCaught);

    // Update text
    options.children[0].textContent = "Escaped!";

    // Discard Smoke Bomb
    for (let i = 0; i < userList[userIndex].cards.length; i++) {
      if (userList[userIndex].cards[i] === 16) {
        gameCards.removeCards([i]);
        setTimeout(dialogue.closeDialogueBox, 1000);
        return;
      }
    }
    // Close window after delay
    setTimeout(dialogue.closeDialogueBox, 1000);
  },

  assailantCaught: function () {
    const options = document.getElementById("roll-options");
    const optionButtonA = document.getElementById("roll-option-a");
    const optionButtonB = document.getElementById("roll-option-b");

    // Remove Event Listeners
    optionButtonA.removeEventListener("click", dashboard.assailantSmokeBomb);
    optionButtonB.removeEventListener("click", dashboard.assailantCaught);

    // Injury
    if (dashboard.hazard.type < 20) {
      dashboard.sendToHospital();
    }
    // Loss of cards or money
    else if (dashboard.hazard.type < 25) {
      //  Player relinquishes cards or money
      options.children[0].textContent =
        "You must relinquish $1500 or 5 of your cards at random.";
      optionButtonA.textContent = "Relinquish Money";
      optionButtonB.textContent = "Relinquish Cards";
      optionButtonA.className = "";
      optionButtonB.className = "";
      options.style.display = "flex";
      optionButtonA.addEventListener(
        "click",
        dashboard.assailantRelinquishMoney
      );
      optionButtonB.addEventListener(
        "click",
        dashboard.assailantRelinquishCards
      );
      return;
    }
    // Loss of money
    else if (dashboard.hazard.type < 30) {
      dashboard.addMoney(-300);
    }

    // Close window after delay
    setTimeout(dialogue.closeDialogueBox, 2000);
  },

  assailantRelinquishMoney: function () {
    console.log("relinquishing money");
    const optionButtonA = document.getElementById("roll-option-a");
    const optionButtonB = document.getElementById("roll-option-b");

    optionButtonA.removeEventListener(
      "click",
      dashboard.assailantRelinquishMoney
    );
    optionButtonB.removeEventListener(
      "click",
      dashboard.assailantRelinquishCards
    );
    optionButtonA.classList.add("disabled");
    optionButtonB.classList.add("disabled");

    dialogue.closeDialogueBox();
    dashboard.addMoney(-1500);
  },

  assailantRelinquishCards: function () {
    console.log("relinquishing cards");
    const optionButtonA = document.getElementById("roll-option-a");
    const optionButtonB = document.getElementById("roll-option-b");

    optionButtonA.removeEventListener(
      "click",
      dashboard.assailantRelinquishMoney
    );
    optionButtonB.removeEventListener(
      "click",
      dashboard.assailantRelinquishCards
    );
    optionButtonA.classList.add("disabled");
    optionButtonB.classList.add("disabled");

    dialogue.closeDialogueBox();
    gameCards.removeCardsRandom(5);
  },

  openRollToFix: function () {
    console.log("opening roll-to-fix");
    const rollMessageElement = document.getElementById("roll-message");
    const options = document.getElementById("roll-options");
    const minRoll = Math.floor(3 / dashboard.currentJobMultiplier) + 1;
    console.log(`Min Roll: ${minRoll}`);

    dialogue.openRollDice(6);
    rollMessageElement.textContent = `You need at least ${minRoll} to succeed.`;
    rollMessageElement.style.display = "block";
    options.style.display = "none";
    dialogue.rollXButton.addEventListener("click", dashboard.rollToFix);
    dialogue.showDialogueControls(true, false);
    // Add event listeners
    dialogue.closeWindowElement.addEventListener(
      "click",
      dialogue.closeDialogueBox
    );
    dialogue.backdropElement.addEventListener(
      "click",
      dialogue.closeDialogueBox
    );
  },
  rollToFix: function () {
    console.log("client is rolling to fix");
    // Variables
    const rollResultElement = document.getElementById("roll-result");
    const rollMessageElement = document.getElementById("roll-message");
    const jobIndex = userList[userIndex].currentJobIndex;
    const job = game.jobsArray[jobIndex];
    const location = jobData.locations[job.locIndex];
    const type = jobData.types[job.typeIndex];
    let totalExp = 1 + job.exp + location.exp + type.diffexpay;
    let totalReward = job["base-reward"] * (1 + location.pay + type.diffexpay);

    game.hasRolledToFix = true;

    dialogue.rollResult = dialogue.randomInt(dialogue.numDie);
    const score = dialogue.rollResult * dashboard.currentJobMultiplier;
    rollResultElement.textContent = dialogue.rollResult;
    console.log(`Roll Result: ${dialogue.rollResult}`);
    console.log(`Score: ${score}`);

    // Disable buttons
    dialogue.rollXButton.classList.add("disabled");
    dashboard.rollToFixButton.classList.add("disabled");
    // Remove event listeners
    dialogue.rollXButton.removeEventListener("click", dashboard.rollToFix);
    dashboard.rollToFixButton.removeEventListener(
      "click",
      dashboard.openRollToFix
    );
    dialogue.closeWindowElement.removeEventListener(
      "click",
      dialogue.closeDialogueBox
    );
    dialogue.backdropElement.removeEventListener(
      "click",
      dialogue.closeDialogueBox
    );

    // Manage roll success or failure
    if (score >= 3) {
      console.log("player fixed job");
      // Display roll text
      rollMessageElement.textContent = "The job was fixed successfully!";
      rollMessageElement.style.display = "block";
      // Update turnInfo
      dashboard.turnInfo.jobOutcome = {
        jobId: jobIndex,
        status: 2,
      };
      // Update player stats
      const moneyEarnBonus = userList[userIndex].bonusMoneyEarn.hold;
      const expGainBonus = userList[userIndex].bonusExpGain.hold;
      const newMoney =
        userList[userIndex].money + totalReward * (1 + moneyEarnBonus);
      const newExp =
        userList[userIndex].exp + totalExp * 50 * (1 + expGainBonus);
      socket.emit("update player stats", {
        roomId,
        userIndex,
        newUserStats: { money: newMoney, exp: newExp },
      });
      // Update jobsArray
      socket.emit("update job status", {
        roomId,
        jobId: jobIndex,
        status: 2,
      });
    } else {
      console.log("player did not fix job");
      // Display roll text
      rollMessageElement.textContent = "Couldn't fix the job today...";
      rollMessageElement.style.display = "block";
      dashboard.turnInfo.jobOutcome = {
        jobId: userList[userIndex].currentJobIndex,
        status: 1,
      };
      // Update player stats
      const expGainBonus = userList[userIndex].bonusExpGain.hold;
      const newExp =
        userList[userIndex].exp + totalExp * 25 * (1 + expGainBonus);
      socket.emit("update player stats", {
        roomId,
        userIndex,
        newUserStats: { exp: newExp },
      });
    }

    // Update job preview
    dashboard.updateJobPreview();

    // Close window after delay
    setTimeout(dialogue.closeDialogueBox, 2000);
  },
  closeRollToFix: function (rollResult) {
    console.log("closing roll-to-fix");
    dialogue.closeDialogueBox();
    dialogue.backdropElement.style.display = "none";
  },

  addMoney: function (amount) {
    let newMoney;
    if (+userList[userIndex].money + amount < 0) {
      newMoney = 0;
    } else {
      newMoney = +userList[userIndex].money + amount;
    }
    socket.emit("update player stats", {
      roomId,
      userIndex,
      newUserStats: { money: newMoney },
    });
  },
};

// EVENT LISTENERS
// Dashboard Button Pressed
dashboard.dashboardButton.addEventListener("click", function () {
  console.log("dashboard opened");
  const dashboardElement = document.getElementById("dashboard");
  const cardsElement = document.getElementById("cards");

  cardsElement.style.display = "none";
  dashboardElement.style.display = "flex";
});

// Cards Button Pressed
dashboard.cardsButton.addEventListener("click", function () {
  console.log("cards opened");
  const dashboardElement = document.getElementById("dashboard");
  const cardsElement = document.getElementById("cards");

  dashboardElement.style.display = "none";
  cardsElement.style.display = "flex";

  gameCards.updateCardsDisplay();
});
