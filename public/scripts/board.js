// DEFINE VARIABLES
const boardSectionElement = document.getElementById("board");
const boardCanvas = document.getElementById("board-grid");
const ctx = boardCanvas.getContext("2d");
const jobsListElement = document.getElementById("jobs");

const cellsHorizontal = 18;
const cellsVertical = 12;
const canvasWidth = 1800;
const canvasHeight = 1200;

//FUNCTIONS
function drawGrid() {
  const cellWidth = canvasWidth / cellsHorizontal;
  const cellHeight = canvasHeight / cellsVertical;

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
}

function drawJob(job) {
  const jobTypes = ["PM", "Op Impacted", "Op Halted", "Catastrophic Failure"];

  // Clone job icon from template
  const jobElement = document
    .getElementById("job-icon-template")
    .cloneNode(true);
  const jobImageElement = jobElement.children[0];
  const jobBubbleElement = jobElement.children[1];

  const canvasRect = boardCanvas.getBoundingClientRect();
  const boardRect = boardSectionElement.getBoundingClientRect();
  const boardCoordinates = [
    (job.coordinates[0] + 90) * 3.2,
    (-job.coordinates[1] + 60) * 3.2,
  ];

  // Filling in values
  jobBubbleElement.children[0].textContent = job.name;
  jobBubbleElement.children[1].textContent = jobTypes[job.jobType];
  jobBubbleElement.children[2].textContent =
    "Difficulty: " + job.difficulty + "x";
  jobBubbleElement.children[3].textContent = "Reward: $" + job.reward;
  if ("hazardPay" in job) {
    jobBubbleElement.children[4].textContent =
      "Hazard Pay: $" + job.hazardPay + "/day";
    jobBubbleElement.children[4].style.display = "block";
  }

  jobsListElement.appendChild(jobElement);
  jobElement.style.top = boardCoordinates[1] + "px";
  jobElement.style.left = boardCoordinates[0] + "px";

  // Place info bubble next to icon
  const bubbleRect = jobBubbleElement.getBoundingClientRect();
  // X-direction
  if (job.coordinates[0] >= 70) {
    jobBubbleElement.style.left = -bubbleRect.width + "px";
  } else if (job.coordinates[0] <= -70) {
    jobBubbleElement.style.left = 0;
  } else {
    jobBubbleElement.style.right = bubbleRect.width / 2 + "px";
  }
  // Y-direction
  if (job.coordinates[1] < 0) {
    jobBubbleElement.style.bottom = bubbleRect.height + 40 + "px";
  }
}

// SOCKET.IO
// Server sends the planet array for a new round
socket.on("display jobs", function (jobsArray) {
  for (const job of jobsArray) {
    drawJob(job);
  }
  // const jobBubbleElements = document.querySelectorAll("#jobs .bubble");
  // for (const bubble of jobBubbleElements) {
  //   bubble.style.display = "none";
  // }
});
