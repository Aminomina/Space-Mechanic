// DEFINE VARIABLES
const boardCanvas = document.getElementById("board-grid");
const ctx = boardCanvas.getContext("2d");

function drawGrid() {
  const cellsHorizontal = 18;
  const cellsVertical = 12;
  const canvasWidth = 1800;
  const canvasHeight = 1200;

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
