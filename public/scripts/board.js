// Properties, methods, and event listeners for board section
const board = {
  // PROPERTIES
  sectionElement: document.getElementById("board"),
  jobsListElement: document.getElementById("jobs"),
  canvas: document.getElementById("board-grid"),
  detailCanvas: document.getElementById("board-detail"),
  // METHODS
  // Draws the board grid
  drawGrid: function () {
    const ctx = board.canvas.getContext("2d");
    const cellsHorizontal = 18;
    const cellsVertical = 12;
    const canvasWidth = 1800;
    const canvasHeight = 1200;
    const cellWidth = canvasWidth / cellsHorizontal;
    const cellHeight = canvasHeight / cellsVertical;

    // Set line color
    ctx.strokeStyle = "rgb(222, 210, 195)";
    // Thick Lines
    ctx.lineWidth = 3;
    for (let i = 0; i <= cellsHorizontal + 1; i += 3) {
      ctx.moveTo(cellWidth * i, 0);
      ctx.lineTo(cellWidth * i, canvasHeight);
    }
    for (let i = 0; i <= cellsVertical + 1; i += 3) {
      ctx.moveTo(0, cellHeight * i);
      ctx.lineTo(canvasWidth, cellHeight * i);
    }
    // Fine Lines
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let i = 0; i <= cellsHorizontal + 1; i++) {
      ctx.moveTo(cellWidth * i, 0);
      ctx.lineTo(cellWidth * i, canvasHeight);
    }
    for (let i = 0; i <= cellsVertical + 1; i++) {
      ctx.moveTo(0, cellHeight * i);
      ctx.lineTo(canvasWidth, cellHeight * i);
    }
    ctx.stroke();
  },

  // Draw Job Line
  drawJobLine: function (startCoordinates, endCoordinates) {
    // ADD CODE TO DISPLAY LINE FROM CURRENT LOCATION TO JOB
    const detCtx = board.detailCanvas.getContext("2d");
    const daysToLocElement = document.getElementById("days-to-loc");
    const daysToLocTextElement = daysToLocElement.children[0];

    // Convert coordinates to canvas coordinates
    const startCanvCoordinates = [
      (startCoordinates[0] + 90) * 10,
      (-startCoordinates[1] + 60) * 10,
    ];
    const endCanvCoordinates = [
      (endCoordinates[0] + 90) * 10,
      (-endCoordinates[1] + 60) * 10,
    ];
    console.log(`start coord: ${startCoordinates}`);
    console.log(`end coord: ${endCoordinates}`);
    console.log(`start canvas coord: ${startCanvCoordinates}`);
    console.log(`end canvas coord: ${endCanvCoordinates}`);

    // Set line style
    detCtx.lineWidth = 4;
    detCtx.strokeStyle = "rgb(71, 200, 204)";

    // Clear any previous lines
    detCtx.clearRect(0, 0, board.detailCanvas.width, board.detailCanvas.height);

    // Draw line
    detCtx.beginPath();
    detCtx.moveTo(startCanvCoordinates[0], startCanvCoordinates[1]);
    detCtx.lineTo(endCanvCoordinates[0], endCanvCoordinates[1]);
    detCtx.stroke();

    // Determine number of days to location
    const distance = Math.sqrt(
      (endCoordinates[0] - startCoordinates[0]) ** 2 +
        (endCoordinates[1] - startCoordinates[1]) ** 2
    );
    console.log(`distance: ${distance}`);
    if (distance === 0) {
      daysToLocTextElement.textContent = "0 Days";
    } else if (distance <= 30) {
      daysToLocTextElement.textContent = "1 Day";
    } else {
      const numDays = Math.floor(distance / 30 + 1);
      daysToLocTextElement.textContent = `${numDays} Days`;
    }

    // Find location of days-to-location icon
    const midCoordX = (startCoordinates[0] + endCoordinates[0]) / 2;
    const midCoordY = (startCoordinates[1] + endCoordinates[1]) / 2;
    let daysToLocCoordinates = [
      (midCoordX + 90) * 3.2,
      (-midCoordY + 60) * 3.2,
    ];

    // Add days-to-location icon
    daysToLocElement.style.left = `${daysToLocCoordinates[0]}px`;
    daysToLocElement.style.top = `${daysToLocCoordinates[1]}px`;
    // Offset if not leaving system
    if (distance === 0) {
      daysToLocElement.style.top = `${daysToLocCoordinates[1] - 28}px`;
    }
    daysToLocElement.style.display = "block";
  },

  // Clear job lines
  clearJobLines: function () {
    const detCtx = board.detailCanvas.getContext("2d");
    const daysToLocElement = document.getElementById("days-to-loc");

    detCtx.clearRect(0, 0, board.detailCanvas.width, board.detailCanvas.height);
    daysToLocElement.style.display = "none";
  },

  // Clear jobs
  clearJobs: function () {
    const numChildElements = board.jobsListElement.children.length;
    for (i = 0; i < numChildElements; i++) {
      board.jobsListElement.removeChild(board.jobsListElement.children[0]);
    }
  },

  // Adds a job to the board
  drawJob: function (job, indices, xOffset = 0, yOffset = 0, numJobs = 1) {
    const jobTypes = ["PM", "Op Impacted", "Op Halted", "Catastrophic Failure"];

    // Clone job icon from template
    const jobElement = document
      .querySelector("#templates .job-icon-template")
      .cloneNode(true);
    const jobIconElement = jobElement.children[0];
    const jobBubbleElement = jobElement.children[1];
    const jobIndicesElement = jobElement.children[2];
    const canvasRect = board.canvas.getBoundingClientRect();
    const boardRect = board.sectionElement.getBoundingClientRect();
    const boardCoordinates = [
      (job.coordinates[0] + xOffset + 90) * 3.2,
      (-job.coordinates[1] - yOffset + 60) * 3.2,
    ];

    // Add an event listener to the icon
    jobIconElement.addEventListener("click", dialogue.openJobDetail);

    // Filling in values
    jobBubbleElement.children[0].textContent = job.name;
    if (numJobs === 1) {
      jobIconElement.children[1].textContent = "";
      jobBubbleElement.children[1].textContent = "1 job";
    } else {
      jobIconElement.children[1].textContent = numJobs;
      jobBubbleElement.children[1].textContent = numJobs + " jobs";
    }
    if (parseFloat(job.difficulty) > 0) {
      jobBubbleElement.children[2].textContent =
        "+" + job.difficulty + "x Difficulty";
      jobBubbleElement.children[2].style.display = "block";
    } else if (parseFloat(job.difficulty) < 0) {
      jobBubbleElement.children[2].textContent =
        job.difficulty + "x Difficulty";
      jobBubbleElement.children[2].style.display = "block";
    } else {
      jobBubbleElement.children[2].textContent = "";
      jobBubbleElement.children[2].style.display = "none";
    }
    jobBubbleElement.children[3].textContent =
      "Base Reward: $" + job["base-reward"];
    if ("hazard-pay" in job) {
      jobBubbleElement.children[4].textContent =
        "Hazard Pay: $" + job["hazard-pay"] + "/Day";
      jobBubbleElement.children[4].style.display = "block";
    }
    jobIndicesElement.textContent = indices;

    board.jobsListElement.appendChild(jobElement);
    jobElement.style.top = boardCoordinates[1] + "px";
    jobElement.style.left = boardCoordinates[0] + "px";

    // Place info bubble next to icon
    const bubbleRect = jobBubbleElement.getBoundingClientRect();
    // X-direction
    if (job.coordinates[0] + xOffset >= 70) {
      jobBubbleElement.style.left = -bubbleRect.width + "px";
    } else if (job.coordinates[0] + xOffset <= -70) {
      jobBubbleElement.style.left = 0;
    } else {
      jobBubbleElement.style.right = bubbleRect.width / 2 + "px";
    }
    // Y-direction
    if (job.coordinates[1] + yOffset < 0) {
      jobBubbleElement.style.bottom = bubbleRect.height + 40 + "px";
    }
  },
  // Draw a cluster of jobs in a pair or cluster formation
  drawJobCluster: function (jobsArray, jobClusterIndices) {
    let numPlanets = jobClusterIndices.length;
    for (let i = 0; i < numPlanets; i++) {
      // Check if multiple jobs on planet
      if (typeof jobClusterIndices[i] !== "object") {
        // One job
        let jobIndex = jobClusterIndices[i];
        let job = jobsArray[jobIndex];
        let xOffset = job["board-offset"][0];
        let yOffset = job["board-offset"][1];
        board.drawJob(job, jobIndex, xOffset, yOffset);
      } else {
        // Multiple jobs on planet
        let jobIndex = jobClusterIndices[i][0];
        let job = jobsArray[jobIndex];
        let xOffset = job["board-offset"][0];
        let yOffset = job["board-offset"][1];
        board.drawJob(
          job,
          jobClusterIndices[i],
          xOffset,
          yOffset,
          jobClusterIndices[i].length
        );
      }
    }
  },
  // Move all ship icons to home position
  homeShips: function () {
    console.log("Homing ships!");
    const positions = [
      [[0, 0, 0]],
      [
        [-3.6, -3.6, 45],
        [3.6, 3.6, 225],
      ],
      [
        [0, -5, 0],
        [-4.3, 2.5, 120],
        [4.3, 2.5, 240],
      ],
      [
        [-4.3, -4.3, 45],
        [4.3, 4.3, 225],
        [-4.3, 4.3, 135],
        [4.3, -4.3, 315],
      ],
    ];
    const shipElements = document.querySelectorAll("#ship-icons li");
    // Make ship icons invisible
    for (const element of shipElements) {
      element.style.display = "none";
    }
    // Move ship icons into position
    for (i = 0; i < userList.length; i++) {
      const user = userList[i];
      const icon = shipElements[i].children[0];
      icon.src = `/images/ship-${user.color}.png`;
      user.coordinates = [0, 0];
      board.moveShip(i, positions[userList.length - 1][i]);
      // Make ship icon visible
      shipElements[i].style.display = "block";
    }
  },
  // Move ship to specified coordinates
  moveShip: function (userIndex, coordinates) {
    console.log(`user index: ${userIndex}`);
    const boardCoordinates = [
      (coordinates[0] + 90) * 3.2,
      (-coordinates[1] + 60) * 3.2,
    ];
    const shipElement = document.querySelectorAll("#ship-icons li")[userIndex];
    console.log(shipElement);
    const shipIcon = shipElement.children[0];
    shipElement.style.top = boardCoordinates[1] + "px";
    shipElement.style.left = boardCoordinates[0] + "px";
    if (coordinates.length === 3) {
      shipIcon.style.transform = `rotate(${coordinates[2]}deg)`;
    }
  },
  // Move ship to a specified job
  movePlayerToJob: function (userIndex, job) {
    //                                                                          LEFT OFF HERE
    // Find an open slot, send ship to associated coordinates
    const slotOffsets = [
      [
        [-4.3, -4.3],
        [4.3, 4.3],
        [-4.3, 4.3],
        [4.3, -4.3],
      ],
      [
        [
          [-1.6, -5.8],
          [-5.8, -1.6],
          [4.3, -4.3],
          [-4.3, 4.3],
        ],
        [
          [1.6, 5.8],
          [5.8, 1.6],
          [-4.3, 4.3],
          [4.3, -4.3],
        ],
      ],
      [
        [
          [-3, -5.2],
          [3, -5.2],
          [6, 0],
          [-6, 0],
        ],
        [
          [-3, 5.2],
          [-6, 0],
          [3, 5.2],
          [-3, -5.2],
        ],
        [
          [6, 0],
          [3, 5.2],
          [3, -5.2],
          [-3, 5.2],
        ],
      ],
    ];
    const planetOffsets = [
      [
        [-2.1, -2.1],
        [2.1, 2.1],
      ],
      [
        [0, -3.5],
        [-3, 1.7],
        [3, 1.7],
      ],
    ];
    console.log(userList);
    console.log(userIndex);
    userList[userIndex].coordinates = job.coordinates;
    let offsets;
    let currentPlanetOffset = [0, 0];
    // Planet is in a cluster
    if ("pos-in-cluster" in job) {
      console.log("planet in cluster!");
      const planetIndex = job["pos-in-cluster"][0];
      const numPlanets = job["pos-in-cluster"][1];
      offsets = slotOffsets[numPlanets - 1][planetIndex];
      console.log(offsets);
      currentPlanetOffset = planetOffsets[numPlanets - 2][planetIndex];
    }
    // Planet not in a cluster
    else {
      offsets = slotOffsets[0];
    }
    for (const offset of offsets) {
      console.log(offset);
      const position = [
        job.coordinates[0] + offset[0] + currentPlanetOffset[0],
        job.coordinates[1] + offset[1] + currentPlanetOffset[1],
      ];
      let isSlotAvailable = true;
      for (user of userList) {
        const userPosition = user.boardCoordinates;
        const distance = Math.sqrt(
          (position[0] - userPosition[0]) ** 2 +
            (position[1] - userPosition[1]) ** 2
        );
        if (distance < 5) {
          console.log(distance);
          isSlotAvailable = false;
        }
      }
      if (isSlotAvailable) {
        // Calculate ship rotation
        let rotation = Math.atan(offset[0] / offset[1]) * 57.3;
        if (offset[1] < 0) {
          rotation += 180;
        }
        console.log(rotation);
        position.push(rotation);
        // Set as new board coordinates
        userList[userIndex].boardCoordinates = position;
        // Place ship icon in position
        console.log(position);
        board.moveShip(userIndex, position);
        return;
      }
    }
  },

  // Return the distance between two coordinate sets
  distanceBetween: function (aCoordinates, bCoordinates) {
    return Math.sqrt(
      (bCoordinates[0] - aCoordinates[0]) ** 2 +
        (bCoordinates[1] - aCoordinates[1]) ** 2
    );
  },

  // Generate an offset in local coordinates
  localToGlobalOffset: function (offset, angle) {
    return [
      offset[0] * Math.cos(angle) - offset[1] * Math.sin(angle),
      offset[0] * Math.sin(angle) + offset[1] * Math.cos(angle),
    ];
  },
};

// SOCKET.IO
// Server sends the planet array for a new round
socket.on("display jobs", function (data) {
  console.log(data.jobsArray);
  console.log(data.jobIndices);
  // Clear previous jobs
  board.clearJobs();
  // Sync client's job array with new array from server
  game.jobsArray = data.jobsArray;
  // Draw each job in correct location
  for (const systemIndex of data.jobIndices) {
    if (typeof systemIndex !== "object") {
      // Only one job in system
      board.drawJob(data.jobsArray[systemIndex], systemIndex);
    } else if (systemIndex.length === 1) {
      // One planet in system, multiple jobs
      board.drawJob(
        data.jobsArray[systemIndex[0][0]],
        systemIndex[0],
        0,
        0,
        systemIndex[0].length
      );
    } else {
      // Multiple jobs in system
      board.drawJobCluster(data.jobsArray, systemIndex);
    }
  }
});
