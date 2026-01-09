// Highlight tool functionality - semi-transparent marker for highlighting

const highlightColors = {
  yellow: "rgba(255, 255, 0, 0.3)",
  green: "rgba(0, 255, 0, 0.3)",
  blue: "rgba(0, 150, 255, 0.3)",
  pink: "rgba(255, 0, 255, 0.3)",
  orange: "rgba(255, 165, 0, 0.3)"
};

let currentHighlightColor = highlightColors.yellow;

function setHighlightColor(color) {
  currentHighlightColor = highlightColors[color] || highlightColors.yellow;
}

function handleHighlightStart(e, canvas, pageIndex) {
  const ctx = canvas.getContext("2d");
  const p = getCanvasPosition(e, canvas);
  const normalizedP = getNormalizedPosition(e, canvas);

  const currentStroke = {
    type: "highlight",
    color: currentHighlightColor,
    width: 20, // Wider than pen
    points: [normalizedP]
  };

  ctx.beginPath();
  ctx.moveTo(p.x, p.y);

  return { highlighting: true, currentStroke };
}

function handleHighlightMove(e, canvas, state) {
  if (!state.highlighting || currentTool !== "highlight") return state;

  const ctx = canvas.getContext("2d");
  const p = getCanvasPosition(e, canvas);
  const normalizedP = getNormalizedPosition(e, canvas);

  state.currentStroke.points.push(normalizedP);

  ctx.lineTo(p.x, p.y);
  ctx.strokeStyle = currentHighlightColor;
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.3;
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  return state;
}

function handleHighlightStop(canvas, pageIndex, state) {
  if (!state.highlighting) return { highlighting: false, currentStroke: null };

  if (state.currentStroke && state.currentStroke.points.length > 0) {
    strokeHistory[pageIndex].push(state.currentStroke);
    undoStacks[pageIndex].push(state.currentStroke);
    redoStacks[pageIndex].length = 0;
  }

  return { highlighting: false, currentStroke: null };
}