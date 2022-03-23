// Properties, Methods, and Event Listeners for the landing page

const landingPage = {
  // Properties
  roomCodeFormElement: document.getElementById("join-room"),
  // Methods
  joinRoom: function (event) {
    event.preventDefault();
    const roomCodeInputElement = document.getElementById("room-input");
    window.location.href = "/game/" + roomCodeInputElement.value;
  },
};

// EVENT LISTENERS
landingPage.roomCodeFormElement.addEventListener(
  "submit",
  landingPage.joinRoom
);
