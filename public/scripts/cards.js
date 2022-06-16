// Properties, methods, and event listeners for dashboard section
const gameCards = {
  //PROPERTIES
  drawnCard: undefined,
  activeCardIndex: undefined,
  rollCard: undefined,
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

    for (let i = 0; i < userList[userIndex].cards.length; i++) {
      const cardElement = cardTemplate.cloneNode(true);
      const cardTitle = cardElement.children[1].children[0];
      const cardIndex = userList[userIndex].cards[i];

      cardTitle.textContent = cardsData[cardIndex].name;
      cardElement.cardIndex = cardIndex;

      // Add event listener
      cardElement.addEventListener("click", function (event) {
        dialogue.openCardDetail(event.currentTarget.cardIndex, false, i);
      });

      cardsList.appendChild(cardElement);
    }
  },
  drawnCardAdd: function (event) {
    console.log("adding drawn card to deck");
    event.target.removeEventListener("click", gameCards.drawnCardAdd);
    dialogue.closeDialogueBox();
    gameCards.addCards([gameCards.drawnCard]);
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
      gameCards.addBonusDiff(-0.25, 0);
    } else if (gameCards.drawnCard === 22) {
      // Chatty Client
      console.log("chatty client");
      gameCards.addBonusDiff(0.25, 0);
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
      if (!userList[userIndex].protections.nonCryptids) {
        dashboard.openRollForHazard({ type: 21, string: "pirates", pay: "0" });
      }
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

  playCard: function (event) {
    console.log("playing card");
    const activeCard = userList[userIndex].cards[gameCards.activeCardIndex];

    event.target.removeEventListener("click", gameCards.playCard);
    dialogue.closeDialogueBox();
    gameCards.removeCards([gameCards.activeCardIndex]);

    // Use Condition 2
    if (activeCard === 4) {
      // The Golden Wrench
      console.log("the golden wrench");
      gameCards.fixJob(true, false);
    } else if (activeCard === 13) {
      // Energy Drink
      console.log("energy drink");
      gameCards.addBonusExp(0.15);
    } else if (activeCard === 18) {
      // Power Cycle
      console.log("power cycle");
      gameCards.rollCard = activeCard;
      dialogue.openCardRoll(6, 6);
    }
    // Use Condition 3
    else if (activeCard === 5) {
      // Super Fuel
      console.log("super fuel");
      gameCards.addTempSpeedBonus(3);
    } else if (activeCard === 6) {
      // Safety Suit
      console.log("safety suit");
      userList[userIndex].protections.accidents = true;
      gameCards.addBonusDiff(0, 0.25);
    } else if (activeCard === 7) {
      // Bodyguard Voucher
      console.log("bodyguard voucher");
      userList[userIndex].protections.nonCryptids = true;
    } else if (activeCard === 8) {
      // PTO
      console.log("pto");
      gameCards.sendHomePTO();
    } else if (activeCard === 12) {
      // Cryptid Repellent
      console.log("cryptid repellent");
      userList[userIndex].protections.cryptids = true;
    }
  },

  cardRollAction: function (isSuccess) {
    dialogue.closeDialogueBox();
    if (gameCards.rollCard === 18) {
      //Power Cycle
      if (isSuccess) {
        gameCards.fixJob(true, true);
      }
    }
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
    const moneyEarnBonus = userList[userIndex].bonusMoneyEarn.hold;
    const expGainBonus = userList[userIndex].bonusExpGain.hold;
    const newMoney = userList[userIndex].money + 1000 * (1 + moneyEarnBonus);
    const newExp = userList[userIndex].exp + 150 * (1 + expGainBonus);
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

  sendHomePTO: function () {
    console.log("PTO");
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
    dashboard.addMoney(300);
    // Update player status
    socket.emit("update player status", {
      roomId: roomId,
      userIndex: userIndex,
      actionStatus: 7,
    });
  },

  addBonusDiff: function (dayBonus = 0, weekBonus = 0) {
    userList[userIndex].bonusDiff.day += dayBonus;
    userList[userIndex].bonusDiff.week += weekBonus;
    if (userList[userIndex].currentJobIndex >= 0) {
      dashboard.registerJob(userList[userIndex].currentJobIndex);
    }
  },

  addBonusExp: function (dayBonus = 0, weekBonus = 0) {
    userList[userIndex].bonusExp.day += dayBonus;
    userList[userIndex].bonusExp.week += weekBonus;
    if (userList[userIndex].currentJobIndex >= 0) {
      dashboard.registerJob(userList[userIndex].currentJobIndex);
    }
  },

  addTempSpeedBonus: function (tempDaysAdd) {
    socket.emit("add speed bonus", {
      roomId: roomId,
      userIndex: userIndex,
      tempDaysAdd,
    });
  },

  fixJob: function (pay = true, exp = true) {
    let jobIndex = dashboard.turnInfo.jobOutcome.jobId;
    const job = game.jobsArray[jobIndex];
    const location = jobData.locations[job.locIndex];
    const type = jobData.types[job.typeIndex];
    const totalReward =
      job["base-reward"] * (1 + location.pay + type.diffexpay);
    let totalExp = 1 + job.exp + location.exp + type.diffexpay;

    game.hasRolledToFix = true;

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
    const newExp = userList[userIndex].exp + totalExp * 50 * (1 + expGainBonus);
    if (pay) {
      socket.emit("update player stats", {
        roomId,
        userIndex,
        newUserStats: { money: newMoney },
      });
    }
    if (exp) {
      socket.emit("update player stats", {
        roomId,
        userIndex,
        newUserStats: { exp: newExp },
      });
    }

    // Update jobsArray
    socket.emit("update job status", {
      roomId,
      jobId: jobIndex,
      status: 2,
    });
    // Disable roll-to-fix button
    dashboard.rollToFixButton.classList.add("disabled");
    dashboard.rollToFixButton.removeEventListener(
      "click",
      dashboard.openRollToFix
    );
    // Update job preview
    dashboard.updateJobPreview();
  },

  // Clear all temporary bonuses and protection from previous day
  clearDayBonuses: function () {
    console.log("clearing day bonuses");
    // Clear bonuses
    userList[userIndex].bonusDiff.day = 0;
    userList[userIndex].bonusExp.day = 0;
  },

  // Clear all temporary bonuses and protections from previous round
  clearRoundBonuses: function () {
    console.log("clearing round bonuses");
    // Clear bonuses
    userList[userIndex].bonusDiff.week = 0;
    userList[userIndex].bonusExp.week = 0;
    // Clear protections
    userList[userIndex].protections.cryptids = false;
    userList[userIndex].protections.nonCryptids = false;
    userList[userIndex].protections.accidents = false;
    // Return any bonuses from hold cards
  },
  updateHoldBonuses: function () {
    let isLuckyWrench = false;
    let isTrainingBand = false;
    let isSilverTongue = false;
    let isBoosterRocket = false;
    for (let i = 0; i < userList[userIndex].cards.length; i++) {
      // Lucky Wrench
      if (userList[userIndex].cards[i] === 0) {
        isLuckyWrench = true;
      }
      // Training Band
      else if (userList[userIndex].cards[i] === 1) {
        isTrainingBand = true;
      }
      // Silver Tongue
      else if (userList[userIndex].cards[i] === 2) {
        isSilverTongue = true;
      }
      // Booster Rocket
      else if (userList[userIndex].cards[i] === 3) {
        isBoosterRocket = true;
      }
    }
    if (isLuckyWrench) {
      console.log("client has lucky wrench!");
      userList[userIndex].bonusExp.hold = 0.25;
    } else {
      userList[userIndex].bonusExp.hold = 0;
    }
    if (isTrainingBand) {
      console.log("client has training band!");
      userList[userIndex].bonusExpGain.hold = 0.25;
    } else {
      userList[userIndex].bonusExpGain.hold = 0;
    }
    if (isSilverTongue) {
      console.log("client has silver tongue!");
      userList[userIndex].bonusMoneyEarn.hold = 0.25;
    } else {
      userList[userIndex].bonusMoneyEarn.hold = 0;
    }
    if (isBoosterRocket) {
      console.log("client has booster rocket!");
      socket.emit("add speed bonus", {
        roomId: roomId,
        userIndex: userIndex,
        hold: 0.5,
      });
    } else {
      socket.emit("add speed bonus", {
        roomId: roomId,
        userIndex: userIndex,
        hold: 0,
      });
    }

    if (userList[userIndex].currentJobIndex >= 0) {
      dashboard.registerJob(userList[userIndex].currentJobIndex);
    }
  },
};

// SOCKET.IO
// Server updates user's card deck
socket.on("update cards", function (cards) {
  console.log("updating client card deck");
  userList[userIndex].cards = cards;
  gameCards.updateHoldBonuses();
  gameCards.updateCardsDisplay();
});

socket.on("update speed bonus", function (data) {
  console.log("updating client speed bonus");
  for (const property in data) {
    userList[userIndex].bonusSpeed[property] = data[property];
  }
});
