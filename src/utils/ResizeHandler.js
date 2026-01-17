// ResizeHandler.js - Centralized resize logic for all object types

/**
 * Resize a single object based on handle and delta
 * @param {Object} obj - The object to resize
 * @param {string} handle - The handle being dragged (tl, tr, bl, br, t, b, l, r)
 * @param {number} dx - Normalized x delta
 * @param {number} dy - Normalized y delta
 * @param {CanvasRenderingContext2D} ctx - Canvas context for text measurement
 * @param {HTMLCanvasElement} canvas - Canvas for dimension reference
 */
function resizeObject(obj, handle, dx, dy, ctx, canvas) {
  if (obj.type === "text") {
    resizeText(obj, handle, dx, dy, ctx, canvas);
  } else if (obj.type === "image" || obj.type === "signature-image") {
    resizeImage(obj, handle, dx, dy, canvas);
  } else if (obj.type === "stamp") {
    resizeStamp(obj, handle, dx, dy, canvas);
  } else if (obj.type === "shape") {
    resizeShape(obj, handle, dx, dy);
  } else if (obj.points && obj.points.length > 0) {
    resizePenStroke(obj, handle, dx, dy);
  }
}

/**
 * Initialize original properties before resize starts
 */
function initResizeOriginals(obj) {
  if (obj.type === "text") {
    obj._origFontSize = obj.fontSize;
    obj._origY = obj.y;
  } else if (
    obj.type === "image" ||
    obj.type === "signature-image" ||
    obj.type === "stamp"
  ) {
    obj._origX = obj.x;
    obj._origY = obj.y;
    obj._origW = obj.width;
    obj._origH = obj.height;
  } else if (obj.type === "shape") {
    obj._origStartX = obj.startX;
    obj._origStartY = obj.startY;
    obj._origEndX = obj.endX;
    obj._origEndY = obj.endY;
  } else if (obj.points && obj.points.length > 0) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    obj.points.forEach((pt) => {
      minX = Math.min(minX, pt.x);
      minY = Math.min(minY, pt.y);
      maxX = Math.max(maxX, pt.x);
      maxY = Math.max(maxY, pt.y);
    });
    obj._origPts = obj.points.map((pt) => ({ x: pt.x, y: pt.y }));
    obj._origMinX = minX;
    obj._origMinY = minY;
    obj._origMaxX = maxX;
    obj._origMaxY = maxY;
  }
}

/**
 * Clean up original properties after resize ends
 */
function cleanupResizeOriginals(obj) {
  delete obj._origFontSize;
  delete obj._origX;
  delete obj._origY;
  delete obj._origW;
  delete obj._origH;
  delete obj._origStartX;
  delete obj._origStartY;
  delete obj._origEndX;
  delete obj._origEndY;
  delete obj._origPts;
  delete obj._origMinX;
  delete obj._origMinY;
  delete obj._origMaxX;
  delete obj._origMaxY;
}

// ========== Type-specific resize functions ==========

function resizeText(obj, handle, dx, dy, ctx, canvas) {
  if (!obj._origFontSize) return;

  let newFontSize = obj._origFontSize;

  if (handle.includes("t")) {
    newFontSize = obj._origFontSize - dy;
    obj.y = obj._origY + dy;
  } else if (handle.includes("b")) {
    newFontSize = obj._origFontSize + dy;
  }

  // Clamp font size
  newFontSize = Math.max(
    8 / canvas.height,
    Math.min(200 / canvas.height, newFontSize)
  );
  obj.fontSize = newFontSize;

  // Recalculate width
  ctx.font = `${newFontSize * canvas.height}px Arial`;
  obj.width = ctx.measureText(obj.text).width / canvas.width;
}

function resizeImage(obj, handle, dx, dy, canvas) {
  if (!obj._origW) return;

  const aspectRatio = obj._origW / obj._origH;
  let newX = obj._origX,
    newY = obj._origY,
    newW = obj._origW,
    newH = obj._origH;

  if (handle === "br") {
    newW = obj._origW + dx;
    newH = newW / aspectRatio;
  } else if (handle === "bl") {
    newW = obj._origW - dx;
    newH = newW / aspectRatio;
    newX = obj._origX + dx;
  } else if (handle === "tr") {
    newW = obj._origW + dx;
    newH = newW / aspectRatio;
    newY = obj._origY + dy;
  } else if (handle === "tl") {
    newW = obj._origW - dx;
    newH = newW / aspectRatio;
    newX = obj._origX + dx;
    newY = obj._origY + (obj._origH - newH);
  } else if (handle === "r") {
    newW = obj._origW + dx;
  } else if (handle === "l") {
    newW = obj._origW - dx;
    newX = obj._origX + dx;
  } else if (handle === "b") {
    newH = obj._origH + dy;
  } else if (handle === "t") {
    newH = obj._origH - dy;
    newY = obj._origY + dy;
  }

  const minSize = 20 / canvas.width;
  if (newW > minSize && newH > minSize) {
    obj.x = newX;
    obj.y = newY;
    obj.width = newW;
    obj.height = newH;
  }
}

function resizeStamp(obj, handle, dx, dy, canvas) {
  if (!obj._origW) return;

  const aspectRatio = obj._origW / obj._origH;
  let newW = obj._origW,
    newH = obj._origH;

  // Stamps resize from center, so we double the delta
  if (handle === "br" || handle === "tr") {
    newW = obj._origW + dx * 2;
    newH = newW / aspectRatio;
  } else if (handle === "bl" || handle === "tl") {
    newW = obj._origW - dx * 2;
    newH = newW / aspectRatio;
  } else if (handle === "r") {
    newW = obj._origW + dx * 2;
  } else if (handle === "l") {
    newW = obj._origW - dx * 2;
  } else if (handle === "b") {
    newH = obj._origH + dy * 2;
  } else if (handle === "t") {
    newH = obj._origH - dy * 2;
  }

  const minSize = 20 / canvas.width;
  if (newW > minSize && newH > minSize) {
    // Center stays the same for stamps
    obj.width = newW;
    obj.height = newH;
  }
}

function resizeShape(obj, handle, dx, dy) {
  if (!obj._origStartX) return;

  let newStartX = obj._origStartX,
    newStartY = obj._origStartY;
  let newEndX = obj._origEndX,
    newEndY = obj._origEndY;

  if (handle === "br") {
    newEndX = obj._origEndX + dx;
    newEndY = obj._origEndY + dy;
  } else if (handle === "bl") {
    newStartX = obj._origStartX + dx;
    newEndY = obj._origEndY + dy;
  } else if (handle === "tr") {
    newEndX = obj._origEndX + dx;
    newStartY = obj._origStartY + dy;
  } else if (handle === "tl") {
    newStartX = obj._origStartX + dx;
    newStartY = obj._origStartY + dy;
  } else if (handle === "r") {
    newEndX = obj._origEndX + dx;
  } else if (handle === "l") {
    newStartX = obj._origStartX + dx;
  } else if (handle === "b") {
    newEndY = obj._origEndY + dy;
  } else if (handle === "t") {
    newStartY = obj._origStartY + dy;
  }

  obj.startX = newStartX;
  obj.startY = newStartY;
  obj.endX = newEndX;
  obj.endY = newEndY;
}

function resizePenStroke(obj, handle, dx, dy) {
  if (!obj._origPts) return;

  const origW = obj._origMaxX - obj._origMinX;
  const origH = obj._origMaxY - obj._origMinY;

  let scaleX = 1,
    scaleY = 1,
    offsetX = 0,
    offsetY = 0;

  if (handle === "br") {
    scaleX = (origW + dx) / origW;
    scaleY = (origH + dy) / origH;
  } else if (handle === "bl") {
    scaleX = (origW - dx) / origW;
    scaleY = (origH + dy) / origH;
    offsetX = dx;
  } else if (handle === "tr") {
    scaleX = (origW + dx) / origW;
    scaleY = (origH - dy) / origH;
    offsetY = dy;
  } else if (handle === "tl") {
    scaleX = (origW - dx) / origW;
    scaleY = (origH - dy) / origH;
    offsetX = dx;
    offsetY = dy;
  } else if (handle === "r") {
    scaleX = (origW + dx) / origW;
  } else if (handle === "l") {
    scaleX = (origW - dx) / origW;
    offsetX = dx;
  } else if (handle === "b") {
    scaleY = (origH + dy) / origH;
  } else if (handle === "t") {
    scaleY = (origH - dy) / origH;
    offsetY = dy;
  }

  obj.points = obj._origPts.map((pt) => ({
    x: obj._origMinX + offsetX + (pt.x - obj._origMinX) * scaleX,
    y: obj._origMinY + offsetY + (pt.y - obj._origMinY) * scaleY,
  }));
}
