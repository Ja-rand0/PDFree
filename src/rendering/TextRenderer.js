// TextRenderer.js - Render text annotations

/**
 * Render a text stroke
 */
function renderText(ctx, stroke, canvasWidth, canvasHeight) {
  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const fontSize = stroke.fontSize * canvasHeight;

  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = stroke.color;
  ctx.fillText(stroke.text, x, y);
}

/**
 * Render selection box for text
 */
function renderTextSelectionBox(
  ctx,
  stroke,
  canvasWidth,
  canvasHeight,
  isSelected
) {
  if (!isSelected) return;

  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const fontSize = stroke.fontSize * canvasHeight;
  const textWidth = stroke.width * canvasWidth;

  const boxX = x - 2;
  const boxY = y - fontSize;
  const boxW = textWidth + 4;
  const boxH = fontSize + 7;
  const cornerRadius = 4;

  // Draw rounded rectangle border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(boxX + cornerRadius, boxY);
  ctx.lineTo(boxX + boxW - cornerRadius, boxY);
  ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + cornerRadius, cornerRadius);
  ctx.lineTo(boxX + boxW, boxY + boxH - cornerRadius);
  ctx.arcTo(
    boxX + boxW,
    boxY + boxH,
    boxX + boxW - cornerRadius,
    boxY + boxH,
    cornerRadius
  );
  ctx.lineTo(boxX + cornerRadius, boxY + boxH);
  ctx.arcTo(boxX, boxY + boxH, boxX, boxY + boxH - cornerRadius, cornerRadius);
  ctx.lineTo(boxX, boxY + cornerRadius);
  ctx.arcTo(boxX, boxY, boxX + cornerRadius, boxY, cornerRadius);
  ctx.closePath();
  ctx.stroke();

  // Draw resize handles
  renderResizeHandles(ctx, boxX, boxY, boxW, boxH);
}

/**
 * Calculate text width for a given string and font size
 */
function calculateTextWidth(ctx, text, fontSize) {
  ctx.font = `${fontSize}px Arial`;
  return ctx.measureText(text).width;
}

/**
 * Create a text stroke object
 */
function createTextStroke(
  text,
  x,
  y,
  color,
  fontSize,
  canvasWidth,
  canvasHeight
) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `${fontSize}px Arial`;
  const textWidth = ctx.measureText(text).width;

  return {
    type: "text",
    text: text,
    x: x / canvasWidth,
    y: y / canvasHeight,
    color: color,
    fontSize: fontSize / canvasHeight,
    width: textWidth / canvasWidth,
  };
}
