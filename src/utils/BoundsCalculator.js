// BoundsCalculator.js - Calculate bounding boxes and handle positions for all object types
// Used by: SelectTool, MultiSelectTool, Renderers

/**
 * Get the bounding box of any object in canvas coordinates
 * @returns {left, top, right, bottom} or null
 */
function getObjectBounds(obj, canvas) {
  if (!obj) return null;

  if (obj.type === "text") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const fontSize = obj.fontSize * canvas.height;
    const width = obj.width * canvas.width;
    return { left: x, top: y - fontSize, right: x + width, bottom: y };
  }

  if (obj.type === "image" || obj.type === "signature-image") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    return {
      left: x,
      top: y,
      right: x + obj.width * canvas.width,
      bottom: y + obj.height * canvas.height,
    };
  }

  if (obj.type === "shape") {
    const startX = obj.startX * canvas.width;
    const startY = obj.startY * canvas.height;
    const endX = obj.endX * canvas.width;
    const endY = obj.endY * canvas.height;

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
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const w = obj.width * canvas.width;
    const h = obj.height * canvas.height;
    return {
      left: x - w / 2,
      top: y - h / 2,
      right: x + w / 2,
      bottom: y + h / 2,
    };
  }

  if (obj.type === "checkbox") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const size = obj.size * canvas.width;
    return {
      left: x,
      top: y,
      right: x + size,
      bottom: y + size,
    };
  }

  if (obj.type === "datestamp") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const fontSize = obj.fontSize * canvas.height;
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${fontSize}px Arial`;
    const dateText = formatDate(obj.date, obj.format || "MM/DD/YYYY");
    const textWidth = ctx.measureText(dateText).width;
    return {
      left: x,
      top: y - fontSize,
      right: x + textWidth,
      bottom: y,
    };
  }

  if (obj.type === "textfield") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const width = obj.width * canvas.width;
    const height = obj.height * canvas.height;
    return {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    };
  }

  if (obj.type === "comment") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const iconSize = 30;
    return {
      left: x,
      top: y,
      right: x + iconSize,
      bottom: y + iconSize,
    };
  }

  if (obj.type === "watermark") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const fontSize = obj.fontSize * canvas.height;
    const tempCtx = document.createElement("canvas").getContext("2d");
    tempCtx.font = `bold ${fontSize}px Arial`;
    const textWidth = tempCtx.measureText(obj.text).width;
    const halfWidth = textWidth / 2;
    const halfHeight = fontSize / 2;
    return {
      left: x - halfWidth,
      top: y - halfHeight,
      right: x + halfWidth,
      bottom: y + halfHeight,
    };
  }

  // Pen strokes, highlights, signatures with points
  if (obj.points && obj.points.length > 0) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    obj.points.forEach((pt) => {
      const px = pt.x * canvas.width;
      const py = pt.y * canvas.height;
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    });

    return { left: minX, top: minY, right: maxX, bottom: maxY };
  }

  return null;
}

/**
 * Get the bounding box with padding for selection display
 */
function getSelectionBounds(obj, canvas, padding = 5) {
  const bounds = getObjectBounds(obj, canvas);
  if (!bounds) return null;

  return {
    left: bounds.left - padding,
    top: bounds.top - padding,
    right: bounds.right + padding,
    bottom: bounds.bottom + padding,
    width: bounds.right - bounds.left + padding * 2,
    height: bounds.bottom - bounds.top + padding * 2,
  };
}

/**
 * Check which resize handle (if any) is at a given position
 * @returns 'tl'|'tr'|'bl'|'br'|'t'|'b'|'l'|'r'|null
 */
function getHandleAtPosition(x, y, obj, canvas, hitArea = 80) {
  if (!obj) return null;

  const bounds = getSelectionBounds(obj, canvas);
  if (!bounds) return null;

  const { left, top, width, height } = bounds;

  // Check all 8 handles
  // Corners
  if (Math.abs(x - left) < hitArea && Math.abs(y - top) < hitArea) return "tl";
  if (Math.abs(x - (left + width)) < hitArea && Math.abs(y - top) < hitArea)
    return "tr";
  if (Math.abs(x - left) < hitArea && Math.abs(y - (top + height)) < hitArea)
    return "bl";
  if (
    Math.abs(x - (left + width)) < hitArea &&
    Math.abs(y - (top + height)) < hitArea
  )
    return "br";

  // Edges
  if (Math.abs(x - (left + width / 2)) < hitArea && Math.abs(y - top) < hitArea)
    return "t";
  if (
    Math.abs(x - (left + width / 2)) < hitArea &&
    Math.abs(y - (top + height)) < hitArea
  )
    return "b";
  if (
    Math.abs(x - left) < hitArea &&
    Math.abs(y - (top + height / 2)) < hitArea
  )
    return "l";
  if (
    Math.abs(x - (left + width)) < hitArea &&
    Math.abs(y - (top + height / 2)) < hitArea
  )
    return "r";

  return null;
}

/**
 * Check if an object intersects with a selection box
 */
function isObjectInSelectionBox(
  obj,
  boxLeft,
  boxTop,
  boxRight,
  boxBottom,
  canvas
) {
  const bounds = getObjectBounds(obj, canvas);
  if (!bounds) return false;

  // Check for intersection (not containment)
  return !(
    bounds.right < boxLeft ||
    bounds.left > boxRight ||
    bounds.bottom < boxTop ||
    bounds.top > boxBottom
  );
}

/**
 * Get unified bounds for multiple objects
 */
function getMultiObjectBounds(objects, canvas) {
  if (!objects || objects.length === 0) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  objects.forEach((obj) => {
    const bounds = getObjectBounds(obj, canvas);
    if (bounds) {
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.right);
      maxY = Math.max(maxY, bounds.bottom);
    }
  });

  if (minX === Infinity) return null;

  return {
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Get the 8 handle positions for a bounding box
 */
function getHandlePositions(bounds, padding = 10) {
  const { left, top, width, height } = bounds;
  const boxLeft = left - padding;
  const boxTop = top - padding;
  const boxWidth = width + padding * 2;
  const boxHeight = height + padding * 2;

  return {
    tl: { x: boxLeft, y: boxTop },
    tr: { x: boxLeft + boxWidth, y: boxTop },
    bl: { x: boxLeft, y: boxTop + boxHeight },
    br: { x: boxLeft + boxWidth, y: boxTop + boxHeight },
    t: { x: boxLeft + boxWidth / 2, y: boxTop },
    b: { x: boxLeft + boxWidth / 2, y: boxTop + boxHeight },
    l: { x: boxLeft, y: boxTop + boxHeight / 2 },
    r: { x: boxLeft + boxWidth, y: boxTop + boxHeight / 2 },
  };
}
