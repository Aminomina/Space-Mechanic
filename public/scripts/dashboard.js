// Properties, methods, and event listeners for dashboard section
const dashboard = {
  // PROPERTIES
  endTurnButton: document.getElementById("end-turn"),
  rollToFixButton: document.getElementById("roll-to-fix"),
  turnInfo: {
    roomId: roomId,
    userIndex: undefined,
    newJobChoice: -1,
    jobOutcome: {},
    newUserStats: {},
    currentJobMultiplier: undefined,
  },
  currentJobInfo: {
    totalDiff: undefined,
    totalExp: undefined,
    totalReward: undefined,
  },
  hasRolledToFix: false,
  // METHODS
  endTurn: function () {
    console.log("Ending turn");
    dashboard.endTurnButton.removeEventListener("click", dashboard.endTurn);
    dashboard.rollToFixButton.removeEventListener(
      "click",
      dashboard.openRollToFix
    );
    game.isTurn = false;
    game.hasRolledToFix = false;

    //Player has abandoned a job
    if (
      dashboard.turnInfo.newJobChoice !== -1 &&
      "jobId" in dashboard.turnInfo.jobOutcome &&
      game.jobsArray[dashboard.turnInfo.jobOutcome.jobId].status !== 2 &&
      dashboard.turnInfo.jobOutcome.status !== 2
    ) {
      console.log("Abandoning job");
      dashboard.turnInfo.jobOutcome.status = 0;
    }

    // Send turn info to server
    console.log(dashboard.turnInfo);
    socket.emit("turn end", dashboard.turnInfo);

    dashboard.updateLocationString();
    board.clearJobLines();

    // Reset turn info, but keep job outcome if user still at site
    if (userList[userIndex].actionStatus !== 1) {
      dashboard.turnInfo.jobOutcome = {};
    }
    dashboard.turnInfo.newUserStats = {};

    // Disable buttons
    dashboard.endTurnButton.classList.add("disabled");
    dashboard.rollToFixButton.classList.add("disabled");
  },
  updateLocationString: function () {
    const locationStringElement = document.getElementById("location-string");
    console.log(userList[userIndex].actionStatus);
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
    } else if (userList[userIndex].actionStatus === 3) {
      locationStringElement.textContent = `You're in open space.`;
    } else if (userList[userIndex].actionStatus === 4) {
      locationStringElement.textContent = `You're in the hospital.`;
    } else {
      locationStringElement.textContent = "";
    }
  },
  updateJobPreview: function () {
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
    const kExp = 2 - 0.999 ** exp;
    const kDiff = dashboard.currentJobInfo.totalDiff;
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
      dialogue.closeDialogueBox();
      // dashboard.turnInfo.newJobChoice = jobId;
      // Check if old job had hazard
      const isOldJobHazard =
        game.jobsArray[oldJobId]["hazard-type"] !== 0 &&
        game.jobsArray[oldJobId].locIndex !== 6;
      const isNewJobHazard =
        game.jobsArray[jobId]["hazard-type"] !== 0 &&
        game.jobsArray[jobId].locIndex !== 6;
      if (
        (isNewJobHazard && !isOldJobHazard) ||
        (isNewJobHazard &&
          game.jobsArray[jobId].name !== game.jobsArray[oldJobId].name)
      ) {
        dashboard.openRollForHazard(
          game.jobsArray[jobId]["hazard-type"],
          game.jobsArray[jobId]["hazard-roll-string"]
        );
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
    console.log("deregistering job!");
    dashboard.turnInfo.newJobChoice = -1;
    dashboard.updateJobPreview();
    dashboard.updateLocationString();
  },
  sendToHospital: function () {
    // Player spends rest of week in hospital
    userList[userIndex].actionStatus = 4;

    // Abandon job
    console.log("Abandoning job");
    dashboard.turnInfo.jobOutcome = {
      jobId: userList[userIndex].currentJobIndex,
      status: 0,
    };
    dashboard.turnInfo.newJobChoice = -2;

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
  openRollForHazard: function (hazardType, hazardString) {
    const rollHeadingElement = document.getElementById("roll-dice-heading");
    const rollMessageElement = document.getElementById("roll-message");
    if (+hazardType < 15) {
      dialogue.openRollDice(6);
    } else if (+hazardType < 20) {
      dialogue.openRollDice(3);
    } else if (+hazardType < 30) {
      dialogue.openRollDice(9);
    } else if (+hazardType < 40) {
      dialogue.openRollDice(12);
    }

    rollHeadingElement.textContent = `Roll for ${hazardString}!`;
    rollMessageElement.textContent = "Don't roll a 1!";
    rollMessageElement.style.display = "block";
    dialogue.rollXButton.addEventListener("click", dashboard.rollForHazard);
  },
  rollForHazard: function () {
    // Variables
    const rollResultElement = document.getElementById("roll-result");
    const rollMessageElement = document.getElementById("roll-message");

    const currentJob = game.jobsArray[userList[userIndex].currentJobIndex];
    const hazardType = currentJob["hazard-type"];
    const hazardString = currentJob["hazard-roll-string"];

    dialogue.rollResult = dialogue.randomInt(dialogue.numDie);
    rollResultElement.textContent = dialogue.rollResult;

    // Disable button
    dialogue.rollXButton.classList.add("disabled");

    // Remove event listeners
    dialogue.rollXButton.removeEventListener("click", dashboard.rollForHazard);

    // Manage roll success or failure
    if (dialogue.rollResult >= 2) {
      console.log("success!");

      // Display roll text
      rollMessageElement.textContent = `You avoided ${hazardString}!`;
      rollMessageElement.style.display = "block";
    } else {
      console.log("not successful.");
      // Display roll text
      // Assailants
      if (hazardType % 5 === 1) {
        rollMessageElement.textContent = `Oh no! You got caught by ${hazardString}!`;
      } else if (hazardType === 30) {
        rollMessageElement.textContent = `Oh no! You got caught in the ${hazardString}!`;
      } else {
        rollMessageElement.textContent = `Oh no! You fell victim to ${hazardString}!`;
      }
      rollMessageElement.style.display = "block";

      // Injury
      if (hazardType < 20) {
        dashboard.sendToHospital();
      }
      // Theft
      else if (hazardType < 30) {
        // Player relinquishes cards or money
        // Update turnInfo
        let newMoney = userList[userIndex].money - 1500;
        if (newMoney < 0) {
          newMoney = 0;
        }

        // Update player stats
        socket.emit("update player stats", {
          roomId,
          userIndex,
          newUserStats: { money: newMoney },
        });
      }
      // Natural Disaster
      else if (hazardType < 40) {
        dashboard.sendToHospital();
      }
    }

    // Close window after delay
    setTimeout(dialogue.closeDialogueBox, 2000);
  },
  openRollToFix: function () {
    const rollMessageElement = document.getElementById("roll-message");
    const minRoll = Math.floor(3 / dashboard.currentJobMultiplier) + 1;
    console.log(`Min Roll: ${minRoll}`);

    dialogue.openRollDice(6);
    rollMessageElement.textContent = `You need at least ${minRoll} to succeed.`;
    rollMessageElement.style.display = "block";
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
    // Variables
    const rollResultElement = document.getElementById("roll-result");
    const rollMessageElement = document.getElementById("roll-message");

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
      console.log("success!");
      // Define Variables
      const jobIndex = userList[userIndex].currentJobIndex;
      const job = game.jobsArray[jobIndex];
      const location = jobData.locations[job.locIndex];
      const type = jobData.types[job.typeIndex];
      let totalExp = 1 + job.exp + location.exp + type.diffexpay;
      let totalReward =
        job["base-reward"] * (1 + location.pay + type.diffexpay);

      // Display roll text
      rollMessageElement.textContent = "The job was fixed successfully!";
      rollMessageElement.style.display = "block";

      // Update turnInfo
      const newMoney = userList[userIndex].money + totalReward;
      const newExp = userList[userIndex].exp + totalExp * 50;
      dashboard.turnInfo.jobOutcome = {
        jobId: jobIndex,
        status: 2,
      };

      // Update player stats
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
      console.log("not successful.");
      rollMessageElement.textContent = "Couldn't fix the job today...";
      rollMessageElement.style.display = "block";
      dashboard.turnInfo.jobOutcome = {
        jobId: userList[userIndex].currentJobIndex,
        status: 1,
      };
    }

    // Update job preview
    dashboard.updateJobPreview();

    // Close window after delay
    setTimeout(dialogue.closeDialogueBox, 2000);
  },
  closeRollToFix: function (rollResult) {
    dialogue.closeDialogueBox();
    dialogue.backdropElement.style.display = "none";
  },
};
