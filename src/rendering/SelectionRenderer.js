// SelectionRenderer.js - Render selection boxes and multi-select UI

/**
 * Render unified selection box for multiple objects
 */
function renderMultiSelectionBox(
  ctx,
  objects,
  canvasWidth,
  canvasHeight,
  pageIndex
) {
  if (!objects || objects.length <= 1) return;
  if (selectedPageIndex !== pageIndex) return;

  const bounds = calculateMultiBounds(objects, canvasWidth, canvasHeight);
  if (!bounds) return;

  const padding = 10;
  const boxLeft = bounds.minX - padding;
  const boxTop = bounds.minY - padding;
  const boxWidth = bounds.maxX - bounds.minX + padding * 2;
  const boxHeight = bounds.maxY - bounds.minY + padding * 2;

  // Draw dashed border
  ctx.strokeStyle = "#2196F3";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(boxLeft, boxTop, boxWidth, boxHeight);
  ctx.setLineDash([]);

  // Draw resize handles
  renderResizeHandles(ctx, boxLeft, boxTop, boxWidth, boxHeight, "#2196F3");
}

/**
 * Calculate bounds for multiple objects
 */
function calculateMultiBounds(objects, canvasWidth, canvasHeight) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  objects.forEach((obj) => {
    const objBounds = getObjectBoundsForRender(obj, canvasWidth, canvasHeight);
    if (objBounds) {
      minX = Math.min(minX, objBounds.left);
      minY = Math.min(minY, objBounds.top);
      maxX = Math.max(maxX, objBounds.right);
      maxY = Math.max(maxY, objBounds.bottom);
    }
  });

  if (minX === Infinity) return null;

  return { minX, minY, maxX, maxY };
}

/**
 * Get bounds for a single object (for rendering)
 */
function getObjectBoundsForRender(obj, canvasWidth, canvasHeight) {
  if (obj.type === "text") {
    const x = obj.x * canvasWidth;
    const y = obj.y * canvasHeight;
    const fontSize = obj.fontSize * canvasHeight;
    const width = obj.width * canvasWidth;
    return { left: x, top: y - fontSize, right: x + width, bottom: y };
  }

  if (obj.type === "image" || obj.type === "signature-image") {
    const x = obj.x * canvasWidth;
    const y = obj.y * canvasHeight;
    return {
      left: x,
      top: y,
      right: x + obj.width * canvasWidth,
      bottom: y + obj.height * canvasHeight,
    };
  }

  if (obj.type === "shape") {
    const startX = obj.startX * canvasWidth;
    const startY = obj.startY * canvasHeight;
    const endX = obj.endX * canvasWidth;
    const endY = obj.endY * canvasHeight;

    if (obj.shapeType === "circle") {
      const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      return {
        left: startX - radius,
        top: startY - radius,
        right: startX + radius,
        bottom: startY + radius,
      };
    }

    return {
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
      right: Math.max(startX, endX),
      bottom: Math.max(startY, endY),
    };
  }

  if (obj.type === "stamp") {
    const x = obj.x * canvasWidth;
    const y = obj.y * canvasHeight;
    const w = obj.width * canvasWidth;
    const h = obj.height * canvasHeight;
    return {
      left: x - w / 2,
      top: y - h / 2,
      right: x + w / 2,
      bottom: y + h / 2,
    };
  }

  // Pen strokes and other point-based objects
  if (obj.points && obj.points.length > 0) {
    let pMinX = Infinity,
      pMinY = Infinity,
      pMaxX = -Infinity,
      pMaxY = -Infinity;

    obj.points.forEach((pt) => {
      const px = pt.x * canvasWidth;
      const py = pt.y * canvasHeight;
      pMinX = Math.min(pMinX, px);
      pMinY = Math.min(pMinY, py);
      pMaxX = Math.max(pMaxX, px);
      pMaxY = Math.max(pMaxY, py);
    });

    return { left: pMinX, top: pMinY, right: pMaxX, bottom: pMaxY };
  }

  return null;
}

/**
 * Render drag selection box (while dragging)
 */
function renderDragSelectionBox(ctx, startX, startY, currentX, currentY) {
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  // Draw border
  ctx.strokeStyle = "#2196F3";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(left, top, width, height);
  ctx.setLineDash([]);

  // Fill with transparent blue
  ctx.fillStyle = "rgba(33, 150, 243, 0.1)";
  ctx.fillRect(left, top, width, height);
}

/**
 * Check if selection should show (single object, not in multi-select)
 */
function shouldShowSingleSelection(stroke, selectedObj, pageIndex) {
  return (
    selectedObj === stroke &&
    selectedPageIndex === pageIndex &&
    (!selectedObjects || selectedObjects.length <= 1)
  );
}
