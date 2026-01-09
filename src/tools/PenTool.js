// Pen tool functionality

function handlePenStart(e, canvas, pageIndex) {
  const ctx = canvas.getContext("2d");
  const p = getCanvasPosition(e, canvas);
  const normalizedP = getNormalizedPosition(e, canvas);

  const currentStroke = {
    color: strokeColor,
    width: strokeWidth,
    points: [normalizedP],
  };

  ctx.beginPath();
  ctx.moveTo(p.x, p.y);

  return { drawing: true, currentStroke };
}

function handlePenMove(e, canvas, state) {
  if (!state.drawing || currentTool !== "pen") return state;

  const ctx = canvas.getContext("2d");
  const p = getCanvasPosition(e, canvas);
  const normalizedP = getNormalizedPosition(e, canvas);

  state.currentStroke.points.push(normalizedP);

  ctx.lineTo(p.x, p.y);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  return state;
}

function handlePenStop(canvas, pageIndex, state) {
  if (!state.drawing) return { drawing: false, currentStroke: null };

  if (state.currentStroke && state.currentStroke.points.length > 0) {
    strokeHistory[pageIndex].push(state.currentStroke);
    undoStacks[pageIndex].push(state.currentStroke);
    redoStacks[pageIndex].length = 0;
  }

  return { drawing: false, currentStroke: null };
}
