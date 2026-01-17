// ShapeRenderer.js - Render shapes (rectangle, circle, line, arrow)

/**
 * Render a shape stroke
 */
function renderShape(ctx, stroke, canvasWidth, canvasHeight) {
  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const startX = stroke.startX * canvasWidth;
  const startY = stroke.startY * canvasHeight;
  const endX = stroke.endX * canvasWidth;
  const endY = stroke.endY * canvasHeight;

  switch (stroke.shapeType) {
    case "rectangle":
      renderRectangle(ctx, startX, startY, endX, endY);
      break;
    case "circle":
      renderCircle(ctx, startX, startY, endX, endY);
      break;
    case "line":
      renderLine(ctx, startX, startY, endX, endY);
      break;
    case "arrow":
      renderArrow(ctx, startX, startY, endX, endY);
      break;
  }
}

function renderRectangle(ctx, startX, startY, endX, endY) {
  const width = endX - startX;
  const height = endY - startY;
  ctx.strokeRect(startX, startY, width, height);
}

function renderCircle(ctx, startX, startY, endX, endY) {
  const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
  ctx.arc(startX, startY, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function renderLine(ctx, startX, startY, endX, endY) {
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

function renderArrow(ctx, startX, startY, endX, endY) {
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

/**
 * Render selection box for a shape
 */
function renderShapeSelectionBox(
  ctx,
  stroke,
  canvasWidth,
  canvasHeight,
  isSelected
) {
  if (!isSelected) return;

  const startX = stroke.startX * canvasWidth;
  const startY = stroke.startY * canvasHeight;
  const endX = stroke.endX * canvasWidth;
  const endY = stroke.endY * canvasHeight;

  let left, top, width, height;

  if (stroke.shapeType === "circle") {
    const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    left = startX - radius;
    top = startY - radius;
    width = radius * 2;
    height = radius * 2;
  } else {
    left = Math.min(startX, endX);
    top = Math.min(startY, endY);
    width = Math.abs(endX - startX);
    height = Math.abs(endY - startY);
  }

  const padding = 5;

  // Draw dashed border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(
    left - padding,
    top - padding,
    width + padding * 2,
    height + padding * 2
  );
  ctx.setLineDash([]);

  // Draw resize handles
  renderResizeHandles(
    ctx,
    left - padding,
    top - padding,
    width + padding * 2,
    height + padding * 2
  );
}

/**
 * Render shape preview during drawing
 */
function renderShapePreview(
  ctx,
  shapeType,
  startX,
  startY,
  endX,
  endY,
  color,
  lineWidth
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();

  switch (shapeType) {
    case "rectangle":
      renderRectangle(ctx, startX, startY, endX, endY);
      break;
    case "circle":
      renderCircle(ctx, startX, startY, endX, endY);
      break;
    case "line":
      renderLine(ctx, startX, startY, endX, endY);
      break;
    case "arrow":
      renderArrow(ctx, startX, startY, endX, endY);
      break;
  }
}
