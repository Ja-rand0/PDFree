// ToolHelpers.js - Shared helper functions for tools

/**
 * Get canvas position from mouse/touch event
 */
function getCanvasPosition(e, canvas) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

/**
 * Get normalized position (0-1 range) from mouse/touch event
 */
function getNormalizedPosition(e, canvas) {
  const p = getCanvasPosition(e, canvas);
  return {
    x: p.x / canvas.width,
    y: p.y / canvas.height,
  };
}

/**
 * Convert canvas position to normalized
 */
function normalizePosition(x, y, canvasWidth, canvasHeight) {
  return {
    x: x / canvasWidth,
    y: y / canvasHeight,
  };
}

/**
 * Convert normalized position to canvas
 */
function denormalizePosition(normX, normY, canvasWidth, canvasHeight) {
  return {
    x: normX * canvasWidth,
    y: normY * canvasHeight,
  };
}

/**
 * Calculate distance between two points
 */
function pointDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Check if a point is within a rectangle
 */
function pointInRect(px, py, left, top, right, bottom) {
  return px >= left && px <= right && py >= top && py <= bottom;
}

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Add stroke to history with undo support
 */
function addStrokeToHistory(pageIndex, stroke) {
  strokeHistory[pageIndex].push(stroke);
  undoStacks[pageIndex].push(stroke);
  redoStacks[pageIndex].length = 0;
}

/**
 * Remove stroke from history with undo support
 */
function removeStrokeFromHistory(pageIndex, stroke) {
  const idx = strokeHistory[pageIndex].indexOf(stroke);
  if (idx > -1) {
    const deletedStroke = strokeHistory[pageIndex].splice(idx, 1)[0];
    undoStacks[pageIndex].push({ type: "delete", stroke: deletedStroke });
    redoStacks[pageIndex].length = 0;
    return true;
  }
  return false;
}

/**
 * Clear selection state
 */
function clearSelection() {
  selectedText = null;
  selectedImage = null;
  selectedShape = null;
  selectedStamp = null;
  selectedSignature = null;
  selectedStroke = null;
  selectedObjects = [];
  selectedPageIndex = null;
}

/**
 * Set single object selection
 */
function selectObject(obj, pageIndex) {
  clearSelection();

  if (!obj) return;

  selectedPageIndex = pageIndex;

  if (obj.type === "text") {
    selectedText = obj;
  } else if (obj.type === "image") {
    selectedImage = obj;
  } else if (obj.type === "shape") {
    selectedShape = obj;
  } else if (obj.type === "stamp") {
    selectedStamp = obj;
  } else if (obj.type === "signature-image") {
    selectedSignature = obj;
  } else if (obj.points) {
    selectedStroke = obj;
  }
}
