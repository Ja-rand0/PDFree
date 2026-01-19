// RedactionTool.js - Black bar and white out redaction tools

let currentRedactionType = "blackbar"; // "blackbar" or "whiteout"

function setRedactionType(type) {
  if (type === "blackbar" || type === "whiteout") {
    currentRedactionType = type;
  }
}

function handleRedactionStart(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);

  return {
    drawing: true,
    startX: p.x / canvas.width,
    startY: p.y / canvas.height,
  };
}

function handleRedactionMove(e, canvas, pageIndex, state) {
  if (!state.drawing) return state;

  const p = getCanvasPosition(e, canvas);
  const ctx = canvas.getContext("2d");

  // Redraw everything
  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);

  // Draw preview rectangle
  const startX = state.startX * canvas.width;
  const startY = state.startY * canvas.height;
  const width = p.x - startX;
  const height = p.y - startY;

  if (currentRedactionType === "blackbar") {
    ctx.fillStyle = "#000000";
  } else {
    ctx.fillStyle = "#FFFFFF";
  }

  ctx.fillRect(startX, startY, width, height);

  // Draw border for visibility (especially for white out)
  ctx.strokeStyle = currentRedactionType === "blackbar" ? "#FFFFFF" : "#CCCCCC";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(startX, startY, width, height);
  ctx.setLineDash([]);

  return { ...state, currentX: p.x / canvas.width, currentY: p.y / canvas.height };
}

function handleRedactionStop(canvas, pageIndex, state) {
  if (!state.drawing) return { drawing: false };

  const ctx = canvas.getContext("2d");

  // Calculate final rectangle dimensions
  const x = Math.min(state.startX, state.currentX || state.startX);
  const y = Math.min(state.startY, state.currentY || state.startY);
  const width = Math.abs((state.currentX || state.startX) - state.startX);
  const height = Math.abs((state.currentY || state.startY) - state.startY);

  // Only create redaction if it has some size
  if (width > 0.001 && height > 0.001) {
    const redaction = {
      type: "redaction",
      redactionType: currentRedactionType,
      x: x,
      y: y,
      width: width,
      height: height,
    };

    strokeHistory[pageIndex].push(redaction);
    undoStacks[pageIndex].push(redaction);
    redoStacks[pageIndex].length = 0;
  }

  // Final redraw
  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);

  return { drawing: false };
}
