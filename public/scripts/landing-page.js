// SETUP AND VARIABLES
const roomCodeButtonElement = document.getElementById("join-room-button");
const roomCodeFormElement = document.getElementById("join-room");

// FUNCTIONS
function joinRoom(event) {
  event.preventDefault();
  const roomCodeInputElement = document.getElementById("room-input");
  window.location.href = "/game/" + roomCodeInputElement.value;
}

// EVENT LISTENERS
roomCodeFormElement.addEventListener("submit", joinRoom);
