// Properties, methods, and event listeners for the info tab

const info = {
  // PROPERTIES
  playersTabElement: document.getElementById("info-players-tab"),
  rulesTabElement: document.getElementById("info-rules-tab"),
  settingsTabElement: document.getElementById("info-settings-tab"),
  // playersElement: document.getElementById("info-players"),
  // rulesElement: document.getElementById("info-rules"),
  // settingsElement: document.getElementById("info-settings"),
  playerEntryElements: document.querySelectorAll(".info-player-entry"),
  playerNameIcons: document.querySelectorAll(".info-player-name img"),
  playerNameElements: document.querySelectorAll(".info-player-name span"),
  playerMoneyIcons: document.querySelectorAll(".info-player-money img"),
  playerMoneyElements: document.querySelectorAll(".info-player-money span"),
  playerExpIcons: document.querySelectorAll(".info-player-exp img"),
  playerExpElements: document.querySelectorAll(".info-player-exp span"),
  rulesLeftElement: document.getElementById("rules-left"),
  rulesRightElement: document.getElementById("rules-right"),
  rulesTabIndex: 0,
  numRulesTabs: document.querySelectorAll(".rule-page").length,
  rulesTabNames: [
    "Overview",
    "Jobs",
    "Days & Weeks",
    "Travel",
    "Hazards",
    "Cards",
  ],

  // METHODS
  openTab: function (tabIndex) {
    const tabElements = document.querySelectorAll(".info-tab");
    const contentElements = document.querySelectorAll(".info-content-article");

    for (const tab of tabElements) {
      tab.classList.remove("active");
    }
    for (const content of contentElements) {
      content.classList.remove("active");
    }

    tabElements[tabIndex].classList.add("active");
    contentElements[tabIndex].classList.add("active");
  },
  openRulesTab: function (pageIndex) {
    console.log("rules page changed");
    const pageElements = document.querySelectorAll(".rule-page");
    const pageTitleElement = document.getElementById("rules-page-title");

    for (const page of pageElements) {
      page.classList.remove("active");
    }

    pageTitleElement.textContent = info.rulesTabNames[pageIndex];
    pageElements[pageIndex].classList.add("active");
  },
  updateRoundInfo: function () {
    console.log("updated round info display");
    const currentRoundElement = document.getElementById("info-current-round");
    const endConditionElement = document.getElementById("info-end-condition");

    currentRoundElement.textContent = `Week ${game.currentRound}, Day ${game.currentDay}`;
    if (game.endConditionType === "rounds") {
      if (+game.endConditionRounds === 1) {
        endConditionElement.textContent = `Playing ${game.endConditionRounds} week`;
      } else {
        endConditionElement.textContent = `Playing ${game.endConditionRounds} weeks`;
      }
    } else if (game.endConditionType === "money") {
      endConditionElement.textContent = `Goal: $${game.endConditionMoney}`;
    }
  },
  showPlayerList: function () {
    console.log("updated players list display");
    for (let i = 0; i < userList.length; i++) {
      const money = (+userList[game.order[i]].money).toFixed(2);
      const exp = (+userList[game.order[i]].exp).toFixed(0);
      info.playerEntryElements[i].style.display = "block";
      info.playerEntryElements[i].classList.remove(
        "red",
        "blue",
        "purple",
        "green",
        "active"
      );
      info.playerNameElements[i].classList.remove("squish");
      info.playerEntryElements[i].classList.add(userList[game.order[i]].color);
      info.playerNameElements[i].textContent = userList[game.order[i]].name;
      info.playerMoneyElements[i].textContent = money;
      info.playerExpElements[i].textContent = exp;
      info.playerNameIcons[i].src =
        "/images/icons/wrench-" + userList[game.order[i]].color + "-small.png";
      if (info.playerNameElements[i].offsetWidth > 135) {
        info.playerNameElements[i].classList.add("squish");
      }
      // Highlight active player (if applicable)
      if (game.order[i] === game.activeUserIndex) {
        info.playerEntryElements[i].classList.add("active");
      }
    }
  },
  resetPlayersList: function () {
    console.log("players list reset");
    for (let i = 0; i < 4; i++) {
      info.playerEntryElements[i].style.display = "none";
      info.playerEntryElements[i].classList.remove(
        "red",
        "blue",
        "purple",
        "green"
      );
      info.playerNameElements[i].classList.remove("squish");
      info.playerNameElements[i].textContent = "Player X";
      info.playerMoneyElements[i].textContent = "0";
      info.playerExpElements[i].textContent = "0";
      info.playerNameIcons[i].src = "/images/icons/wrench-red.png";
    }
  },
};

// EVENT LISTENERS
//   Click on Players Tab
info.playersTabElement.addEventListener("click", function () {
  console.log("players tab opened");
  info.openTab(0);
});

//   Click on Rules Tab
info.rulesTabElement.addEventListener("click", function () {
  console.log("rules tab opened");
  info.openTab(1);
});

//   Click on Settings Tab
info.settingsTabElement.addEventListener("click", function () {
  console.log("settings tab opened");
  info.openTab(2);
});

//   Click on Rules Left
info.rulesLeftElement.addEventListener("click", function () {
  if (info.rulesTabIndex !== 0) {
    info.rulesTabIndex--;
  } else {
    console.log(info.numRulesTabs);
    info.rulesTabIndex = info.numRulesTabs - 1;
  }
  info.openRulesTab(info.rulesTabIndex);
});

//   Click on Rules Right
info.rulesRightElement.addEventListener("click", function () {
  if (info.rulesTabIndex !== info.numRulesTabs - 1) {
    info.rulesTabIndex++;
  } else {
    info.rulesTabIndex = 0;
  }
  info.openRulesTab(info.rulesTabIndex);
});
