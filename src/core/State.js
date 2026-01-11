// Global state variables
let pdfBytes,
  pages = [],
  strokeColor = "#ff0000",
  strokeWidth = 2,
  zoom = 1,
  minZoom = 0.25,
  maxZoom = 2,
  isRendering = false,
  pendingZoom = null,
  currentTool = "pen",
  selectedText = null,
  selectedImage = null,
  selectedShape = null,
  selectedStamp = null,
  selectedSignature = null,
  selectedStroke = null,
  selectedPageIndex = null;

// Store strokes as vector data
const strokeHistory = [];
const undoStacks = [];
const redoStacks = [];

// Helper function to check if a click hits a shape
function checkShapeClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  // Check in reverse order (most recent first)
  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type === "shape") {
      const x1 = stroke.startX * canvasWidth;
      const y1 = stroke.startY * canvasHeight;
      const x2 = stroke.endX * canvasWidth;
      const y2 = stroke.endY * canvasHeight;

      let left, right, top, bottom;
      const hitMargin = 35;

      if (stroke.shapeType === "circle") {
        // For circles, calculate bounding box from radius
        const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        left = x1 - radius;
        right = x1 + radius;
        top = y1 - radius;
        bottom = y1 + radius;
      } else {
        // For other shapes, use min/max of start and end points
        left = Math.min(x1, x2);
        right = Math.max(x1, x2);
        top = Math.min(y1, y2);
        bottom = Math.max(y1, y2);
      }

      if (
        x >= left - hitMargin &&
        x <= right + hitMargin &&
        y >= top - hitMargin &&
        y <= bottom + hitMargin
      ) {
        return stroke;
      }
    }
  }
  return null;
}

// Helper function to check if a click hits a stamp
function checkStampClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  // Check in reverse order (most recent first)
  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type === "stamp") {
      const stampX = stroke.x * canvasWidth;
      const stampY = stroke.y * canvasHeight;
      const stampWidth = stroke.width * canvasWidth;
      const stampHeight = stroke.height * canvasHeight;

      // Stamps are centered at x,y
      const left = stampX - stampWidth / 2;
      const right = stampX + stampWidth / 2;
      const top = stampY - stampHeight / 2;
      const bottom = stampY + stampHeight / 2;

      if (x >= left && x <= right && y >= top && y <= bottom) {
        return stroke;
      }
    }
  }
  return null;
}

// Helper function to check if a click hits a signature
function checkSignatureClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  // Check in reverse order (most recent first)
  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type === "signature-image") {
      const sigX = stroke.x * canvasWidth;
      const sigY = stroke.y * canvasHeight;
      const sigWidth = stroke.width * canvasWidth;
      const sigHeight = stroke.height * canvasHeight;

      if (
        x >= sigX &&
        x <= sigX + sigWidth &&
        y >= sigY &&
        y <= sigY + sigHeight
      ) {
        return stroke;
      }
    }
  }
  return null;
}

// Helper function to check if a click hits a pen stroke
function checkPenStrokeClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  // Check in reverse order (most recent first)
  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (
      (stroke.type === "pen" || stroke.type === "highlight") &&
      stroke.points &&
      stroke.points.length > 0
    ) {
      // Check if click is near any point in the stroke
      const hitDistance = 20; // pixels

      for (let j = 0; j < stroke.points.length; j++) {
        const point = stroke.points[j];
        const px = point.x * canvasWidth;
        const py = point.y * canvasHeight;

        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (distance <= hitDistance) {
          return stroke;
        }
      }
    }
  }
  return null;
}
