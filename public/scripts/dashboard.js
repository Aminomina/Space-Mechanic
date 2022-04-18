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
  },
  // METHODS
  endTurn: function () {
    console.log("Ending turn");
    dashboard.endTurnButton.removeEventListener("click", dashboard.endTurn);
    game.isTurn = false;

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

    // Reset turn info
    dashboard.turnInfo.jobOutcome = {};
    dashboard.turnInfo.newUserStats = {};

    // Disable buttons
    dashboard.endTurnButton.classList.add("disabled");
    dashboard.rollToFixButton.classList.add("disabled");
  },
  updateLocationString: function () {
    const locationStringElement = document.getElementById("location-string");
    if (userList[userIndex].actionStatus === 0) {
      locationStringElement.textContent = "You're at home base.";
    } else if (userList[userIndex].actionStatus === 1) {
      locationStringElement.textContent = `You're in transit to ${userList[userIndex].site}.`;
    } else if (userList[userIndex].actionStatus === 2) {
      locationStringElement.textContent = `You're on ${userList[userIndex].site}.`;
    } else if (userList[userIndex].actionStatus === 3) {
      locationStringElement.textContent = `You're in open space.`;
    } else {
      locationStringElement.textContent = "";
    }
  },
  registerJob: function (jobId) {
    // Exit dialogue window, send job choice to turnInfo object
    dialogue.closeDialogueBox();
    dashboard.turnInfo.newJobChoice = jobId;
    board.drawJobLine(
      userList[userIndex].boardCoordinates,
      game.jobsArray[jobId].coordinates,
      board.distanceBetween(
        userList[userIndex].coordinates,
        game.jobsArray[jobId].coordinates
      )
    );
  },
  deregisterJob: function (jobId) {
    console.log("Job taken!");
    dashboard.turnInfo.newJobChoice = {};
    socket.emit("update player status", {
      roomId: roomId,
      userIndex: userIndex,
      actionStatus: 3,
    });
  },
  openRollToFix: function () {
    console.log("Attempting a fix!");
    // dashboard.turnInfo.jobOutcome = {
    //   jobId: userList[userIndex].currentJobIndex,
    //   status: 2,
    // };
    dialogue.openRollDice(6);
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
    const job = game.jobsArray[userList[userIndex].currentJobIndex];
    const location = jobData.locations[job.locIndex];
    const type = jobData.types[job.typeIndex];
    const exp = userList[userIndex].exp;

    const rollResultElement = document.getElementById("roll-result");
    const rollMessageElement = document.getElementById("roll-message");

    dialogue.rollResult = dialogue.randomInt(dialogue.numDie);
    rollResultElement.textContent = dialogue.rollResult;
    // Disable buttons
    dialogue.rollXButton.classList.add("disabled");
    dashboard.rollToFixButton.classList.add("disabled");
    // Remove event listeners
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

    // Calculate score
    const kExp = 2 - 0.9996 ** exp;
    const kDiff = 1 + job.difficulty + location.difficulty + type.diffexpay;
    const score = (dialogue.rollResult * kExp) / kDiff;
    console.log(score);

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

    // Close window after delay
    setTimeout(dialogue.closeDialogueBox, 2000);
  },
  closeRollToFix: function (rollResult) {
    dialogue.closeDialogueBox();
    dialogue.backdropElement.style.display = "none";
  },
};
