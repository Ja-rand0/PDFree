// WatermarkTool.js - Click to place text watermark

let defaultWatermarkText = "DRAFT";
let watermarkRotation = -45; // degrees
let watermarkOpacity = 0.3;
let watermarkFontSize = 0.08; // Normalized (8% of canvas height)
let watermarkColor = "#888888";

function handleWatermarkClick(e, canvas, pageIndex) {
  const text = prompt("Enter watermark text:", defaultWatermarkText);
  if (text === null || text.trim() === "") return;

  defaultWatermarkText = text;

  const p = getCanvasPosition(e, canvas);

  const watermark = {
    type: "watermark",
    text: text.trim(),
    x: p.x / canvas.width,
    y: p.y / canvas.height,
    fontSize: watermarkFontSize,
    color: watermarkColor,
    opacity: watermarkOpacity,
    rotation: watermarkRotation,
  };

  strokeHistory[pageIndex].push(watermark);
  undoStacks[pageIndex].push(watermark);
  redoStacks[pageIndex].length = 0;

  redrawStrokes(canvas.getContext("2d"), pageIndex, canvas.width, canvas.height);
}

function setWatermarkRotation(degrees) {
  watermarkRotation = degrees;
}

function setWatermarkOpacity(opacity) {
  watermarkOpacity = Math.max(0, Math.min(1, opacity));
}

function setWatermarkColor(color) {
  watermarkColor = color;
}

function setWatermarkFontSize(size) {
  watermarkFontSize = size;
}
