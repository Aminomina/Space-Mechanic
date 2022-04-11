// Properties, methods, and event listeners for dashboard section
const dashboard = {
  // PROPERTIES
  endTurnButton: document.getElementById("end-turn"),
  turnInfo: { newJobChoice: {} },
  // METHODS
  endTurn: function () {
    console.log("Ending turn");
    dashboard.endTurnButton.removeEventListener("click", dashboard.endTurn);
    game.isTurn = false;
    if (Object.keys(dashboard.turnInfo.newJobChoice).length !== 0) {
      console.log("sending job choice to server");
      socket.emit("job chosen", dashboard.turnInfo.newJobChoice);
    } else {
      console.log("no job chosen");
    }
    dashboard.updateLocationString();
    board.clearJobLines();
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
    dashboard.turnInfo.newJobChoice = { roomId, userIndex, jobId };
    board.drawJobLine(
      userList[userIndex].boardCoordinates,
      game.jobsArray[jobId].coordinates
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
};
