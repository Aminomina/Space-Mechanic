// Properties, methods, and event listeners for the info tab

const info = {
  // PROPERTIES
  playersTabElement: document.getElementById("info-players-tab"),
  rulesTabElement: document.getElementById("info-rules-tab"),
  settingsTabElement: document.getElementById("info-settings-tab"),
  playersElement: document.getElementById("info-players"),
  rulesElement: document.getElementById("info-rules"),
  settingsElement: document.getElementById("info-settings"),
  playerEntryElements: document.querySelectorAll(".info-player-entry"),
  playerNameIcons: document.querySelectorAll(".info-player-name img"),
  playerNameElements: document.querySelectorAll(".info-player-name span"),
  playerMoneyIcons: document.querySelectorAll(".info-player-money img"),
  playerMoneyElements: document.querySelectorAll(".info-player-money span"),
  playerExpIcons: document.querySelectorAll(".info-player-exp img"),
  playerExpElements: document.querySelectorAll(".info-player-exp span"),

  // METHODS
  updateRoundInfo: function () {
    const currentRoundElement = document.getElementById("info-current-round");
    const endConditionElement = document.getElementById("info-end-condition");

    currentRoundElement.textContent = `Round ${game.currentRound}`;
    if (game.endConditionType === "rounds") {
      endConditionElement.textContent = `Playing ${game.endConditionRounds} rounds`;
    } else if (game.endConditionType === "money") {
      endConditionElement.textContent = `Goal: $${game.endConditionMoney}`;
    }
  },
  showPlayerList: function () {
    for (let i = 0; i < userList.length; i++) {
      const money = userList[game.order[i]].money.toFixed(2);
      const exp = userList[game.order[i]].exp.toFixed(0);
      info.playerEntryElements[i].style.display = "block";
      info.playerEntryElements[i].classList.remove(
        "red",
        "blue",
        "purple",
        "green"
      );
      info.playerNameElements[i].classList.remove("squish");
      info.playerEntryElements[i].classList.add(userList[game.order[i]].color);
      info.playerNameElements[i].textContent = userList[game.order[i]].name;
      info.playerMoneyElements[i].textContent = money;
      info.playerExpElements[i].textContent = exp;
      info.playerNameIcons[i].src =
        "/images/wrench-" + userList[game.order[i]].color + "-small.png";
      if (info.playerNameElements[i].offsetWidth > 135) {
        info.playerNameElements[i].classList.add("squish");
      }
    }
  },
  resetPlayersList: function () {
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
      info.playerNameIcons[i].src = "/images/wrench-red.png";
    }
  },
};

// EVENT LISTENERS
//   Click on Players Tab
console.log("players");
info.playersTabElement.addEventListener("click", function () {
  const activeTabElement = document.querySelector("#info-tabs .active");
  const activeContentElement = document.querySelector(
    "#info-content article.active"
  );

  activeTabElement.classList.remove("active");
  activeContentElement.classList.remove("active");
  info.playersTabElement.classList.add("active");
  info.playersElement.classList.add("active");
});

//   Click on Rules Tab
info.rulesTabElement.addEventListener("click", function () {
  console.log("rules");
  const activeTabElement = document.querySelector("#info-tabs .active");
  const activeContentElement = document.querySelector(
    "#info-content article.active"
  );

  activeTabElement.classList.remove("active");
  activeContentElement.classList.remove("active");
  info.rulesTabElement.classList.add("active");
  info.rulesElement.classList.add("active");
});

//   Click on Settings Tab
info.settingsTabElement.addEventListener("click", function () {
  console.log("settings");
  const activeTabElement = document.querySelector("#info-tabs .active");
  const activeContentElement = document.querySelector(
    "#info-content article.active"
  );

  activeTabElement.classList.remove("active");
  activeContentElement.classList.remove("active");
  info.settingsTabElement.classList.add("active");
  info.settingsElement.classList.add("active");
});
