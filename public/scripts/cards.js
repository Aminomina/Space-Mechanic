// Properties, methods, and event listeners for dashboard section
const gameCards = {
  //PROPERTIES
  //METHODS
  addCard: function (cardIndex) {
    socket.emit("add card", { roomId, userIndex, cardIndex });
  },
  updateCardsDisplay: function () {
    const cardsList = document.getElementById("cards-list");
    const cardTemplate = document.querySelector("#templates .card");

    console.log(cardsList.children.length);
    while (cardsList.children.length !== 0) {
      cardsList.removeChild(cardsList.children[0]);
      console.log(cardsList.children.length);
    }

    for (const cardIndex of userList[userIndex].cards) {
      console.log(cardsData[cardIndex].name);
      const cardElement = cardTemplate.cloneNode(true);
      const cardTitle = cardElement.children[1].children[0];

      cardTitle.textContent = cardsData[cardIndex].name;
      cardElement.cardIndex = cardIndex;
      console.log(cardElement.cardIndex);

      // Add event listener
      cardElement.addEventListener("click", function (event) {
        console.log(event.currentTarget);
        console.log(cardElement);
        dialogue.openCardDetail(event.currentTarget.cardIndex);
      });

      cardsList.appendChild(cardElement);
    }
  },
};

// SOCKET.IO
// Server updates user's card deck
socket.on("update cards", function (cards) {
  userList[userIndex].cards = cards;
  gameCards.updateCardsDisplay();
});
