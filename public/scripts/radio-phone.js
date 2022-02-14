// SETUP AND VARIABLES
const sineContainterElement = document.getElementById("radio-sine-container");
const messagesElement = document.getElementById("radio-messages");
const radioEntryElement = document.getElementById("radio-entry-box");
const radioInputElement = document.getElementById("radio-entry-input");

// User sends a message
radioEntryElement.addEventListener("submit", function (event) {
  event.preventDefault();
  const message = radioInputElement.value;
  if (radioInputElement.value) {
    socket.emit("chat message", { message, roomId });
    radioInputElement.value = "";
  }
});

// Also submit if enter key is pressed
function checkSubmit(event) {
  if (
    event &&
    event.keyCode == 13 &&
    !event.shiftKey &&
    radioInputElement.value
  ) {
    const message = radioInputElement.value;
    socket.emit("chat message", { message, roomId });
    radioInputElement.value = "";
  }
}

// User receives a message
socket.on("chat message", function (msg) {
  const item = document.createElement("li");
  item.textContent = msg;
  messagesElement.appendChild(item);
  messagesElement.scrollTo(0, document.body.scrollHeight);
  sineContainterElement.classList.remove("incoming"); // reset animation
  void sineContainterElement.offsetWidth; // trigger the reset
  sineContainterElement.classList.add("incoming"); // play animation
  console.log("hello");
});

// Prevent new line when enter is pressed in text area
$("textarea").keydown(function (event) {
  if (event.keyCode == 13) {
    event.preventDefault();
  }
});
