// VARIABLES
const rollXButtonElement = document.getElementById("roll-x");
let numDie = 0;
let isDieRolled = false;

// FUNCTIONS
function rollDice(numDie) {
  return Math.floor(Math.random() * numDie + 1);
}

// function openDialogue(dialogueId) {
//   const activeDialogue = document.getElementById(dialogueId);
//   activeDialogue.style.display = "block";
// }

function openRollDiceDialogue(numSides) {
  const dialogueBoxElement = document.getElementById("dialogue-box");
  const rollDiceElement = document.getElementById("roll-dice");
  const dieSidesElement = document.getElementById("die-sides");
  dialogueBoxElement.style.display = "block";
  rollDiceElement.style.display = "block";
  numDie = numSides;
  dieSidesElement.textContent = numDie;
}

// EVENT LISTENERS
rollXButtonElement.addEventListener("click", function () {
  if (!isDieRolled) {
    const rollResultElement = document.getElementById("roll-result");
    const rollResultNumberElement = document.querySelector("#roll-result span");
    rollResultNumberElement.textContent = rollDice(numDie);
    isDieRolled = true;
    rollXButtonElement.classList.add("disabled");
    rollResultElement.style.display = "block";
  }
});
