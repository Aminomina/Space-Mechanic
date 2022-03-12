// Chat Functionality

const chat = {
  // PROPERTIES
  inputElement: document.getElementById("radio-entry-input"),
  entryElement: document.getElementById("radio-entry-box"),
  // METHODS
};

// EVENT LISTENERS
// User sends a message
chat.entryElement.addEventListener("submit", function (event) {
  event.preventDefault();
  const message = chat.inputElement.value;
  if (chat.inputElement.value) {
    socket.emit("chat message", { message, roomId });
    chat.inputElement.value = "";
  }
});

chat.entryElement.addEventListener("keypress", function (event) {
  if (
    event &&
    event.key === "Enter" &&
    !event.shiftKey &&
    chat.inputElement.value
  ) {
    event.preventDefault();
    const message = chat.inputElement.value;
    socket.emit("chat message", { message, roomId });
    chat.inputElement.value = "";
  }
});

// SOCKET.IO
// User receives a message
socket.on("chat message", function (msg) {
  sineContainterElement = document.getElementById("radio-sine-container");
  messagesElement = document.getElementById("radio-messages");
  const item = document.createElement("li");
  item.textContent = msg;
  messagesElement.appendChild(item);
  messagesElement.scrollTo(0, document.body.scrollHeight);
  sineContainterElement.classList.remove("incoming"); // reset animation
  void sineContainterElement.offsetWidth; // trigger the reset
  sineContainterElement.classList.add("incoming"); // play animation
  console.log("hello");
});
