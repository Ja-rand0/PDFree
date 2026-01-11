// Stamp tool functionality - pre-made stamps for documents

const stamps = {
  approved: { text: "APPROVED", color: "#00AA00", rotation: 0 },
  rejected: { text: "REJECTED", color: "#FF0000", rotation: 0 },
  confidential: { text: "CONFIDENTIAL", color: "#FF0000", rotation: 0 },
  draft: { text: "DRAFT", color: "#888888", rotation: -15 },
  copy: { text: "COPY", color: "#0066CC", rotation: 0 },
  urgent: { text: "URGENT", color: "#FF6600", rotation: 0 },
  final: { text: "FINAL", color: "#009900", rotation: 0 },
  void: { text: "VOID", color: "#FF0000", rotation: 45 },
  checked: { text: "✓", color: "#00AA00", rotation: 0 },
  xmark: { text: "✗", color: "#FF0000", rotation: 0 },
};

let currentStamp = "approved";

function setStamp(stampName) {
  if (stamps[stampName]) {
    currentStamp = stampName;
    console.log("Stamp set to:", stampName);
  }
}

function handleStampClick(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);
  const stamp = stamps[currentStamp];

  if (!stamp) return;

  // Calculate normalized position (center of stamp at click)
  const normalizedX = p.x / canvas.width;
  const normalizedY = p.y / canvas.height;

  // Calculate stamp dimensions for hit detection
  const ctx = canvas.getContext("2d");
  const fontSize = 0.03 * canvas.height;
  ctx.font = `bold ${fontSize}px Arial`;
  const textMetrics = ctx.measureText(stamp.text);
  const textWidth = textMetrics.width;
  const padding = 10;
  const stampWidth = (textWidth + padding * 2) / canvas.width;
  const stampHeight = (fontSize + padding * 2) / canvas.height;

  // Create stamp stroke
  const stampStroke = {
    type: "stamp",
    stampType: currentStamp,
    text: stamp.text,
    color: stamp.color,
    rotation: stamp.rotation,
    x: normalizedX,
    y: normalizedY,
    fontSize: 0.03, // Normalized font size (will scale with canvas)
    width: stampWidth,
    height: stampHeight,
  };

  strokeHistory[pageIndex].push(stampStroke);
  undoStacks[pageIndex].push(stampStroke);
  redoStacks[pageIndex].length = 0;

  // Redraw to show the stamp
  redrawStrokes(
    canvas.getContext("2d"),
    pageIndex,
    canvas.width,
    canvas.height
  );

  console.log(`Placed ${currentStamp} stamp`);
}
