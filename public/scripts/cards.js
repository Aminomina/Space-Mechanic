// Properties, methods, and event listeners for dashboard section
const gameCards = {
  //PROPERTIES
  drawnCard: undefined,
  //METHODS
  // Add a card to client's deck
  addCards: function (cardIndices) {
    console.log("requesting server to add card");
    socket.emit("add cards", { roomId, userIndex, cardIndices });
  },
  // Remove cards from client's deck
  removeCards: function (cardIndices) {
    console.log("requesting server to remove cards");
    socket.emit("remove cards", { roomId, userIndex, cardIndices });
  },
  // Randomly remove some number of cards from client's deck
  removeCardsRandom: function (numLose) {
    const cardsList = userList[userIndex].cards;
    let availableIndices = [];
    let chosenIndices = [];
    for (let i = 0; i < cardsList.length; i++) {
      availableIndices.push(i);
    }
    for (i = 0; i < numLose; i++) {
      const indexIndex = dialogue.randomInt(availableIndices.length) - 1;
      chosenIndices.push(availableIndices.splice(indexIndex, 1)[0]);
    }
    console.log(chosenIndices);
    gameCards.removeCards(chosenIndices);
  },

  updateCardsDisplay: function () {
    console.log("updating cards display");
    const cardsList = document.getElementById("cards-list");
    const cardTemplate = document.querySelector("#templates .card");

    while (cardsList.children.length !== 0) {
      cardsList.removeChild(cardsList.children[0]);
    }

    for (const cardIndex of userList[userIndex].cards) {
      const cardElement = cardTemplate.cloneNode(true);
      const cardTitle = cardElement.children[1].children[0];

      cardTitle.textContent = cardsData[cardIndex].name;
      cardElement.cardIndex = cardIndex;

      // Add event listener
      cardElement.addEventListener("click", function (event) {
        dialogue.openCardDetail(event.currentTarget.cardIndex);
      });

      cardsList.appendChild(cardElement);
    }
  },
  drawnCardAdd: function (event) {
    console.log("adding drawn card to deck");
    event.target.removeEventListener("click", gameCards.drawnCardAdd);
    dialogue.closeDialogueBox();
    gameCards.addCard([gameCards.drawnCard]);
    gameCards.drawnCard = undefined;
  },

  drawnCardAction: function (event) {
    console.log("taking drawn card action");
    event.target.removeEventListener("click", gameCards.drawnCardAction);
    dialogue.closeDialogueBox();
    if (gameCards.drawnCard === 19) {
      // Workplace Accident
      console.log("workplace accident");
      dashboard.sendToHospital();
    } else if (gameCards.drawnCard === 20) {
      // Thieves!
      console.log("thieves!");
      socket.emit("update job status", {
        roomId,
        jobId: userList[userIndex].currentJobIndex,
        status: 3,
        affectPlanet: false,
        userIndex,
      });
    } else if (gameCards.drawnCard === 21) {
      // Breakfast
      console.log("breakfast");
      gameCards.setBonusDiff(-0.25);
    } else if (gameCards.drawnCard === 22) {
      // Chatty Client
      console.log("chatty client");
      gameCards.setBonusDiff(0.25);
    } else if (gameCards.drawnCard === 24) {
      // Safety Inspector
      console.log("safety inspector");
      dashboard.openRollForHazard({
        type: 26,
        string: "the safety inspector",
        pay: "0",
      });
    } else if (gameCards.drawnCard === 25) {
      // Invasion
      console.log("invasion");
      socket.emit("update job status", {
        roomId,
        jobId: userList[userIndex].currentJobIndex,
        status: 3,
        affectPlanet: true,
        userIndex,
      });
    } else if (gameCards.drawnCard === 27) {
      // Pirates!
      console.log("pirates!");
      dashboard.openRollForHazard({ type: 21, string: "pirates", pay: "0" });
    } else if (gameCards.drawnCard === 28) {
      // Fender Bender
      console.log("fender bender");
      dashboard.addMoney(-250);
    } else if (gameCards.drawnCard === 29) {
      // Airlock Breach
      console.log("airlock breach");
      if (userList[userIndex].cards.length >= 5) {
        console.log("5 or more cards!");
        gameCards.removeCardsRandom(3);
      }
    } else if (gameCards.drawnCard === 31) {
      // Ship Repairs
      console.log("ship repairs");
      dashboard.endTurn();
    } else if (gameCards.drawnCard === 33) {
      // Training Week
      gameCards.sendToTraining();
    }
    gameCards.drawnCard = undefined;
  },

  sendToTraining: function () {
    console.log("training week");
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
    // Update player money
    const newMoney = userList[userIndex].money + 1000;
    const newExp = userList[userIndex].exp + 150;
    socket.emit("update player stats", {
      roomId,
      userIndex,
      newUserStats: { money: newMoney, exp: newExp },
    });
    // Update player status
    socket.emit("update player status", {
      roomId: roomId,
      userIndex: userIndex,
      actionStatus: 5,
    });
  },

  setBonusDiff: function (bonus) {
    userList[userIndex].bonusDiff = bonus;
    if (userList[userIndex].currentJobIndex >= 0) {
      dashboard.registerJob(userList[userIndex].currentJobIndex);
    }
  },
};

// SOCKET.IO
// Server updates user's card deck
socket.on("update cards", function (cards) {
  console.log("cards display updated");
  userList[userIndex].cards = cards;
  gameCards.updateCardsDisplay();
});
