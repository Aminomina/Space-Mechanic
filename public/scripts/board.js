// Properties, methods, and event listeners for board section

const board = {
  // PROPERTIES
  sectionElement: document.getElementById("board"),
  canvas: document.getElementById("board-grid"),
  jobsListElement: document.getElementById("jobs"),
  // METHODS
  // Draws the board grid
  drawGrid: function () {
    const cellsHorizontal = 18;
    const cellsVertical = 12;
    const canvasWidth = 1800;
    const canvasHeight = 1200;
    const cellWidth = canvasWidth / cellsHorizontal;
    const cellHeight = canvasHeight / cellsVertical;
    ctx = board.canvas.getContext("2d");

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

  // Adds a job to the board
  drawJob: function (job, xOffset = 0, yOffset = 0, numJobs = 1) {
    const jobTypes = ["PM", "Op Impacted", "Op Halted", "Catastrophic Failure"];

    // Clone job icon from template
    const jobElement = document
      .getElementById("job-icon-template")
      .cloneNode(true);
    const jobIconElement = jobElement.children[0];
    const jobBubbleElement = jobElement.children[1];
    // const jobImageNumberElement = jobElement.children[2];

    const canvasRect = board.canvas.getBoundingClientRect();
    const boardRect = board.sectionElement.getBoundingClientRect();
    const boardCoordinates = [
      (job.coordinates[0] + xOffset + 90) * 3.2,
      (-job.coordinates[1] - yOffset + 60) * 3.2,
    ];

    // Filling in values
    jobBubbleElement.children[0].textContent = job.name;
    if (numJobs === 1) {
      jobIconElement.children[1].textContent = "";
      jobBubbleElement.children[1].textContent = "1 job";
    } else {
      jobIconElement.children[1].textContent = numJobs;
      jobBubbleElement.children[1].textContent = numJobs + " jobs";
    }
    jobBubbleElement.children[2].textContent =
      "Base Difficulty: " + job.difficulty + "x";
    jobBubbleElement.children[3].textContent = "Base Pay: $" + job.reward;
    if ("hazardPay" in job) {
      jobBubbleElement.children[4].textContent =
        "Hazard Pay: $" + job.hazardPay + "/day";
      jobBubbleElement.children[4].style.display = "block";
    }

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
    let pi = 3.14;
    if (jobClusterIndices.length === 2) {
      // Pair of planets
      console.log("pair of planets");
      let radius = 3;
      for (let i = 0; i < 2; i++) {
        // Calculate offset
        let xOffset = radius * Math.cos(pi * (i - 0.75));
        let yOffset = radius * Math.sin(pi * (i - 0.75));
        // Check if multiple jobs on planet
        if (typeof jobClusterIndices[i] !== "object") {
          // One job
          let jobIndex = jobClusterIndices[i];
          board.drawJob(jobsArray[jobIndex], xOffset, yOffset);
        } else {
          // Multiple jobs
          console.log("multiple jobs on planet");
          let jobIndex = jobClusterIndices[i][0];
          board.drawJob(
            jobsArray[jobIndex],
            xOffset,
            yOffset,
            jobClusterIndices[i].length
          );
        }
      }
    } else if (jobClusterIndices.length > 2) {
      numSides = jobClusterIndices.length;
      // Triad of planets
      console.log("triad of planets");
      let radius = 3 / Math.sin(pi / numSides);
      for (let i = 0; i < numSides; i++) {
        // Calculate offset
        let xOffset = radius * Math.cos(pi * ((2 * i) / numSides - 0.5));
        let yOffset = radius * Math.sin(pi * ((2 * i) / numSides - 0.5));
        // Check if multiple jobs on planet
        if (typeof jobClusterIndices[i] !== "object") {
          // One job
          let jobIndex = jobClusterIndices[i];
          board.drawJob(jobsArray[jobIndex], xOffset, yOffset);
        } else {
          // Multiple jobs
          console.log("multiple jobs on planet");
          let jobIndex = jobClusterIndices[i][0];
          board.drawJob(
            jobsArray[jobIndex],
            xOffset,
            yOffset,
            jobClusterIndices[i].length
          );
        }
      }
    }
  },

  // Adds a set of jobs to the board
  // drawJobSet: function (jobsArray) {
  //   const jobIndices = [0, [1, 9, 12], 2, [[3, 7]], 4, [5, [8, 11]], 6, 10];
  // },

  // findDuplicateSystems: function (jobsArray) {},
};

// SOCKET.IO
// Server sends the planet array for a new round
socket.on("display jobs", function (data) {
  for (const systemIndex of data.jobIndices) {
    if (typeof systemIndex !== "object") {
      // Only one job in system
      // console.log(data.jobsArray[systemIndex]);
      board.drawJob(data.jobsArray[systemIndex]);
    } else if (systemIndex.length === 1) {
      console.log("One planet in system, multiple jobs");
      console.log(systemIndex[0][0]);
      board.drawJob(
        data.jobsArray[systemIndex[0][0]],
        0,
        0,
        systemIndex[0].length
      );
    } else {
      // Multiple jobs in system
      board.drawJobCluster(data.jobsArray, systemIndex);
    }
  }
  // const jobBubbleElements = document.querySelectorAll("#jobs .bubble");
  // for (const bubble of jobBubbleElements) {
  //   bubble.style.display = "none";
  // }
});
