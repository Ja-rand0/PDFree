// Shape tool functionality - draw rectangles, circles, arrows, and lines

let currentShape = "rectangle"; // rectangle, circle, arrow, line
let shapeStartPos = null;
let shapeEndPos = null; // Track end position during move
let shapePreviewCanvas = null;

function setShape(shape) {
  currentShape = shape;
  console.log("Shape set to:", shape);
}

function handleShapeStart(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);
  const normalizedP = getNormalizedPosition(e, canvas);

  shapeStartPos = { canvas: p, normalized: normalizedP };

  return {
    drawingShape: true,
    shapeType: currentShape,
    startPos: normalizedP,
  };
}

function handleShapeMove(e, canvas, pageIndex, state) {
  if (!state.drawingShape || currentTool !== "shape") return state;

  const p = getCanvasPosition(e, canvas);
  const normalizedP = getNormalizedPosition(e, canvas);
  const ctx = canvas.getContext("2d");

  // Save end position for later use in handleShapeStop
  shapeEndPos = { canvas: p, normalized: normalizedP };

  // Redraw everything first
  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);

  // Draw preview of shape
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const startX = shapeStartPos.canvas.x;
  const startY = shapeStartPos.canvas.y;
  const endX = p.x;
  const endY = p.y;

  ctx.beginPath();

  if (state.shapeType === "rectangle") {
    const width = endX - startX;
    const height = endY - startY;
    ctx.strokeRect(startX, startY, width, height);
  } else if (state.shapeType === "circle") {
    const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else if (state.shapeType === "line") {
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  } else if (state.shapeType === "arrow") {
    // Draw line
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - arrowAngle),
      endY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + arrowAngle),
      endY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();
  }

  return state;
}

function handleShapeStop(canvas, pageIndex, state) {
  if (!state.drawingShape)
    return { drawingShape: false, shapeType: null, startPos: null };

  // Use saved end position from handleShapeMove
  if (!shapeEndPos) {
    // No movement happened, use start position
    shapeEndPos = shapeStartPos;
  }

  // Create shape stroke
  const shapeStroke = {
    type: "shape",
    shapeType: state.shapeType,
    color: strokeColor,
    width: strokeWidth,
    startX: state.startPos.x,
    startY: state.startPos.y,
    endX: shapeEndPos.normalized.x,
    endY: shapeEndPos.normalized.y,
  };

  strokeHistory[pageIndex].push(shapeStroke);
  undoStacks[pageIndex].push(shapeStroke);
  redoStacks[pageIndex].length = 0;

  // Redraw
  redrawStrokes(
    canvas.getContext("2d"),
    pageIndex,
    canvas.width,
    canvas.height
  );

  shapeStartPos = null;
  shapeEndPos = null;

  return { drawingShape: false, shapeType: null, startPos: null };
}
