// Setting up express
const express = require("express");
const router = express.Router();

// Including data files
const roomData = require("./data/room-data");
const rooms = roomData.rooms;

//   Home Page
router.get("/", function (req, res) {
  res.render("index");
});

//   Rooms
router.get("/game/:id", function (req, res) {
  const roomId = req.params.id;
  for (const room of rooms) {
    if (room.id == roomId) {
      return res.render("game", { room: room });
    }
  }

  res.status(404).render("404-room");
});

//   Start New Game
router.post("/", function (req, res) {
  for (const room of rooms) {
    if (!room.inUse) {
      res.redirect("/game/" + room.id);
      console.log("starting a new game in room " + room.id);
      return;
    }
  }
  // No rooms available
  console.log("No rooms are available right now.");
  res.redirect("/no-rooms-left");
});

//   No Room
router.get("/no-room", function (req, res) {
  res.render("no-room");
});

//   Game Already Started
router.get("/game-started", function (req, res) {
  res.render("game-started");
});

//   No Rooms Left
router.get("/no-rooms-left", function (req, res) {
  res.render("no-rooms-left");
});

//   Game
router.get("/game", function (req, res) {
  res.render("game");
});

module.exports = router;
