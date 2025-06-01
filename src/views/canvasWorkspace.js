let canvas, ctx;
let shapes = [];
let selectedShape = null;
let offsetX, offsetY;
let isDragging = false;

export function initCanvasWorkspace(canvasId) {
  canvas = document.getElementById(canvasId);
  ctx = canvas.getContext("2d");

  // Optional: adjust canvas resolution
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);

  drawGrid(); // draw once initially
  redraw();   // draw existing shapes if any
}

function drawGrid() {
  const spacing = 20;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawShape(shape) {
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  switch (shape.type) {
    case "rectangle":
    case "square":
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      break;
    case "triangle":
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x + shape.sideA, shape.y);
      ctx.lineTo(shape.x + shape.sideB / 2, shape.y - shape.height);
      ctx.closePath();
      ctx.stroke();
      break;
    case "trapezoid":
      const { x, y, topWidth, bottomWidth, height } = shape;
      const xDiff = (bottomWidth - topWidth) / 2;
      ctx.moveTo(x + xDiff, y);
      ctx.lineTo(x + xDiff + topWidth, y);
      ctx.lineTo(x + bottomWidth, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
      ctx.stroke();
      break;
  }
}

function redraw() {
  drawGrid();
  shapes.forEach((shape) => drawShape(shape));
}

function handleMouseDown(e) {
  const { offsetX: mx, offsetY: my } = e;

  // Search for clicked shape from top to bottom
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (isInsideShape(mx, my, shape)) {
      selectedShape = shape;
      offsetX = mx - shape.x;
      offsetY = my - shape.y;
      isDragging = true;
      return;
    }
  }
}

function handleMouseMove(e) {
  if (!isDragging || !selectedShape) return;

  selectedShape.x = e.offsetX - offsetX;
  selectedShape.y = e.offsetY - offsetY;
  redraw();
}

function handleMouseUp() {
  isDragging = false;
  selectedShape = null;
}

function isInsideShape(x, y, shape) {
  switch (shape.type) {
    case "rectangle":
    case "square":
      return (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );
    case "triangle":
      // Bounding box test
      return (
        x >= shape.x &&
        x <= shape.x + shape.sideA &&
        y <= shape.y &&
        y >= shape.y - shape.height
      );
    case "trapezoid":
      // Approximate bounding box
      return (
        x >= shape.x &&
        x <= shape.x + shape.bottomWidth &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );
    default:
      return false;
  }
}

export function addShapeToCanvas(shape) {
  // Provide default x, y if not present
  shape.x = shape.x ?? 100;
  shape.y = shape.y ?? 100;

  shapes.push(shape);
  redraw();
}
