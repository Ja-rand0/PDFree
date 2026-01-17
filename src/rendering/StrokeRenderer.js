// StrokeRenderer.js - Render pen strokes, highlights, and signature strokes

/**
 * Render a pen stroke
 */
function renderPenStroke(ctx, stroke, canvasWidth, canvasHeight) {
  if (!stroke.points || stroke.points.length === 0) return;

  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  stroke.points.forEach((point, idx) => {
    const x = point.x * canvasWidth;
    const y = point.y * canvasHeight;

    if (idx === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

/**
 * Render a highlight stroke (with transparency)
 */
function renderHighlightStroke(ctx, stroke, canvasWidth, canvasHeight) {
  if (!stroke.points || stroke.points.length === 0) return;

  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  stroke.points.forEach((point, idx) => {
    const x = point.x * canvasWidth;
    const y = point.y * canvasHeight;

    if (idx === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
  ctx.globalAlpha = 1.0;
}

/**
 * Render a signature stroke (vector-based, same as pen)
 */
function renderSignatureStroke(ctx, stroke, canvasWidth, canvasHeight) {
  if (!stroke.points || stroke.points.length === 0) return;

  ctx.beginPath();
  ctx.strokeStyle = stroke.color || "#000000";
  ctx.lineWidth = stroke.width || 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  stroke.points.forEach((point, idx) => {
    const x = point.x * canvasWidth;
    const y = point.y * canvasHeight;

    if (idx === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

/**
 * Render selection box for a stroke (pen/highlight)
 */
function renderStrokeSelectionBox(
  ctx,
  stroke,
  canvasWidth,
  canvasHeight,
  isSelected
) {
  if (!isSelected || !stroke.points || stroke.points.length === 0) return;

  // Calculate bounding box
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  stroke.points.forEach((point) => {
    const px = point.x * canvasWidth;
    const py = point.y * canvasHeight;
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const padding = 5;

  // Draw dashed border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(
    minX - padding,
    minY - padding,
    width + padding * 2,
    height + padding * 2
  );
  ctx.setLineDash([]);

  // Draw resize handles
  renderResizeHandles(
    ctx,
    minX - padding,
    minY - padding,
    width + padding * 2,
    height + padding * 2
  );
}

/**
 * Render 8 resize handles for a bounding box
 */
function renderResizeHandles(ctx, left, top, width, height, color = "#000000") {
  const handleSize = 8;
  ctx.fillStyle = color;

  // Corners
  ctx.fillRect(
    left - handleSize / 2,
    top - handleSize / 2,
    handleSize,
    handleSize
  ); // TL
  ctx.fillRect(
    left + width - handleSize / 2,
    top - handleSize / 2,
    handleSize,
    handleSize
  ); // TR
  ctx.fillRect(
    left - handleSize / 2,
    top + height - handleSize / 2,
    handleSize,
    handleSize
  ); // BL
  ctx.fillRect(
    left + width - handleSize / 2,
    top + height - handleSize / 2,
    handleSize,
    handleSize
  ); // BR

  // Edges
  ctx.fillRect(
    left + width / 2 - handleSize / 2,
    top - handleSize / 2,
    handleSize,
    handleSize
  ); // Top
  ctx.fillRect(
    left + width / 2 - handleSize / 2,
    top + height - handleSize / 2,
    handleSize,
    handleSize
  ); // Bottom
  ctx.fillRect(
    left - handleSize / 2,
    top + height / 2 - handleSize / 2,
    handleSize,
    handleSize
  ); // Left
  ctx.fillRect(
    left + width - handleSize / 2,
    top + height / 2 - handleSize / 2,
    handleSize,
    handleSize
  ); // Right
}
