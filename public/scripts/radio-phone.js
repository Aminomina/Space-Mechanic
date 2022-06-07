// Chat Functionality

const chat = {
  // PROPERTIES
  inputElement: document.getElementById("radio-entry-input"),
  entryElement: document.getElementById("radio-entry-box"),
  // METHODS
  sendMessage: function (message) {
    console.log("sending a message to chat");
    socket.emit("chat message", { message, roomId });
    chat.inputElement.value = "";
  },
  //                                                                         Not really sure if this does anything...
  updateChatColor: function (color) {
    const entryBoxElement = document.getElementById("radio-entry-box");
  },
};

// EVENT LISTENERS
// User sends a message
chat.entryElement.addEventListener("submit", function (event) {
  event.preventDefault();
  const message = chat.inputElement.value;
  if (chat.inputElement.value) {
    chat.sendMessage(message);
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
    chat.sendMessage(message);
  }
});

// SOCKET.IO
// User receives a message
socket.on("chat message", function (data) {
  console.log("received message from chat");
  sineContainterElement = document.getElementById("radio-sine-container");
  messagesElement = document.getElementById("radio-messages");
  const item = document.createElement("li");
  item.textContent = data.message;
  item.classList.add(`${data.color}-text`);
  messagesElement.appendChild(item);
  messagesElement.scrollTo(0, document.body.scrollHeight);
  sineContainterElement.classList.remove("incoming"); // reset animation
  void sineContainterElement.offsetWidth; // trigger the reset
  sineContainterElement.classList.add("incoming"); // play animation
});
