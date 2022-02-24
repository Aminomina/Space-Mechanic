// SETUP AND VARIABLES
const infoPlayersTabElement = document.getElementById("info-players-tab");
const infoRulesTabElement = document.getElementById("info-rules-tab");
const infoSettingsTabElement = document.getElementById("info-settings-tab");
const infoPlayersElement = document.getElementById("info-players");
const infoRulesElement = document.getElementById("info-rules");
const infoSettingsElement = document.getElementById("info-settings");
const infoPlayerEntryElements = document.querySelectorAll(".info-player-entry");
const infoPlayerNameIcons = document.querySelectorAll(".info-player-name img");
const infoPlayerNameElements = document.querySelectorAll(
  ".info-player-name span"
);
const infoPlayerMoneyIcons = document.querySelectorAll(
  ".info-player-money img"
);
const infoPlayerMoneyElements = document.querySelectorAll(
  ".info-player-money span"
);
const infoPlayerExpIcons = document.querySelectorAll(".info-player-exp img");
const infoPlayerExpElements = document.querySelectorAll(
  ".info-player-exp span"
);

// FUNCTIONS
function infoShowPlayerListElement(user, index) {
  for (let i = 0; i < userList.length; i++) {
    infoPlayerEntryElements[i].style.display = "block";
    infoPlayerEntryElements[i].classList.add(userList[i].color);
    infoPlayerNameElements[i].textContent = userList[i].name;
    infoPlayerMoneyElements[i].textContent = userList[i].money;
    infoPlayerExpElements[i].textContent = userList[i].exp;
    infoPlayerNameIcons[i].src = "/images/wrench-" + userList[i].color + ".png";
  }
}

function infoDisplayPlayers(userList) {}

// EVENT LISTENERS
//   Click on Players Tab
console.log("players");
infoPlayersTabElement.addEventListener("click", function () {
  const activeTabElement = document.querySelector("#info-tabs .active");
  const activeContentElement = document.querySelector(
    "#info-content article.active"
  );

  activeTabElement.classList.remove("active");
  activeContentElement.classList.remove("active");
  infoPlayersTabElement.classList.add("active");
  infoPlayersElement.classList.add("active");
});

//   Click on Rules Tab
infoRulesTabElement.addEventListener("click", function () {
  console.log("rules");
  const activeTabElement = document.querySelector("#info-tabs .active");
  const activeContentElement = document.querySelector(
    "#info-content article.active"
  );

  activeTabElement.classList.remove("active");
  activeContentElement.classList.remove("active");
  infoRulesTabElement.classList.add("active");
  infoRulesElement.classList.add("active");
});

//   Click on Settings Tab
infoSettingsTabElement.addEventListener("click", function () {
  console.log("settings");
  const activeTabElement = document.querySelector("#info-tabs .active");
  const activeContentElement = document.querySelector(
    "#info-content article.active"
  );

  activeTabElement.classList.remove("active");
  activeContentElement.classList.remove("active");
  infoSettingsTabElement.classList.add("active");
  infoSettingsElement.classList.add("active");
});
