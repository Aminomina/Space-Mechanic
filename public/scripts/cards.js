// Properties, methods, and event listeners for dashboard section
const gameCards = {
  //PROPERTIES
  //METHODS
  addCard: function (cardIndex) {
    console.log("requesting server to add card");
    socket.emit("add card", { roomId, userIndex, cardIndex });
  },
  updateCardsDisplay: function () {
    console.log("updating cards display");
    const cardsList = document.getElementById("cards-list");
    const cardTemplate = document.querySelector("#templates .card");

    while (cardsList.children.length !== 0) {
      cardsList.removeChild(cardsList.children[0]);
    }

    for (const cardIndex of userList[userIndex].cards) {
      const cardElement = cardTemplate.cloneNode(true);
      const cardTitle = cardElement.children[1].children[0];

      cardTitle.textContent = cardsData[cardIndex].name;
      cardElement.cardIndex = cardIndex;

      // Add event listener
      cardElement.addEventListener("click", function (event) {
        dialogue.openCardDetail(event.currentTarget.cardIndex);
      });

      cardsList.appendChild(cardElement);
    }
  },
};

// SOCKET.IO
// Server updates user's card deck
socket.on("update cards", function (cards) {
  console.log("server added card");
  userList[userIndex].cards = cards;
  gameCards.updateCardsDisplay();
});
