// MultiSelectTool.js - Drag-box selection, multi-object resize, and multi-object move
// Split from SelectTool.js for better organization

/**
 * Start a drag-box selection
 */
function startDragBox(p) {
  // Clear all individual selections
  selectedObjects = [];
  selectedText = null;
  selectedImage = null;
  selectedShape = null;
  selectedStamp = null;
  selectedSignature = null;
  selectedStroke = null;
  selectedPageIndex = null;

  return {
    mode: "dragBox",
    dragStartPos: p,
    currentPos: null,
  };
}

/**
 * Update drag-box during mouse move
 */
function updateDragBox(
  ctx,
  pageIndex,
  canvasWidth,
  canvasHeight,
  state,
  currentPos
) {
  const left = Math.min(state.dragStartPos.x, currentPos.x);
  const top = Math.min(state.dragStartPos.y, currentPos.y);
  const width = Math.abs(currentPos.x - state.dragStartPos.x);
  const height = Math.abs(currentPos.y - state.dragStartPos.y);

  // Redraw everything first
  redrawStrokes(ctx, pageIndex, canvasWidth, canvasHeight);

  // Draw selection rectangle
  ctx.strokeStyle = "#2196F3";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(left, top, width, height);
  ctx.setLineDash([]);

  // Fill with transparent blue
  ctx.fillStyle = "rgba(33, 150, 243, 0.1)";
  ctx.fillRect(left, top, width, height);

  return { ...state, currentPos };
}

/**
 * Finish drag-box and select objects within
 */
function finishDragBox(canvas, pageIndex, state) {
  if (!state.currentPos) return [];

  const left = Math.min(state.dragStartPos.x, state.currentPos.x);
  const top = Math.min(state.dragStartPos.y, state.currentPos.y);
  const right = Math.max(state.dragStartPos.x, state.currentPos.x);
  const bottom = Math.max(state.dragStartPos.y, state.currentPos.y);

  const selected = [];
  const strokes = strokeHistory[pageIndex];

  if (strokes) {
    strokes.forEach((obj) => {
      if (isObjectInSelectionBox(obj, left, top, right, bottom, canvas)) {
        selected.push(obj);
      }
    });
  }

  return selected;
}

/**
 * Check if clicking on a multi-select resize handle
 */
function getMultiSelectHandle(p, canvas, hitArea = 80) {
  if (!selectedObjects || selectedObjects.length <= 1) return null;

  const bounds = getMultiObjectBounds(selectedObjects, canvas);
  if (!bounds) return null;

  const padding = 10;
  const boxLeft = bounds.left - padding;
  const boxTop = bounds.top - padding;
  const boxWidth = bounds.width + padding * 2;
  const boxHeight = bounds.height + padding * 2;

  const x = p.x;
  const y = p.y;

  // Check corners
  if (Math.abs(x - boxLeft) < hitArea && Math.abs(y - boxTop) < hitArea)
    return "tl";
  if (
    Math.abs(x - (boxLeft + boxWidth)) < hitArea &&
    Math.abs(y - boxTop) < hitArea
  )
    return "tr";
  if (
    Math.abs(x - boxLeft) < hitArea &&
    Math.abs(y - (boxTop + boxHeight)) < hitArea
  )
    return "bl";
  if (
    Math.abs(x - (boxLeft + boxWidth)) < hitArea &&
    Math.abs(y - (boxTop + boxHeight)) < hitArea
  )
    return "br";

  // Check edges
  if (
    Math.abs(x - (boxLeft + boxWidth / 2)) < hitArea &&
    Math.abs(y - boxTop) < hitArea
  )
    return "t";
  if (
    Math.abs(x - (boxLeft + boxWidth / 2)) < hitArea &&
    Math.abs(y - (boxTop + boxHeight)) < hitArea
  )
    return "b";
  if (
    Math.abs(x - boxLeft) < hitArea &&
    Math.abs(y - (boxTop + boxHeight / 2)) < hitArea
  )
    return "l";
  if (
    Math.abs(x - (boxLeft + boxWidth)) < hitArea &&
    Math.abs(y - (boxTop + boxHeight / 2)) < hitArea
  )
    return "r";

  return null;
}

/**
 * Check if clicking inside multi-select bounds (for moving)
 */
function isInsideMultiSelectBounds(p, canvas) {
  if (!selectedObjects || selectedObjects.length <= 1) return false;

  const bounds = getMultiObjectBounds(selectedObjects, canvas);
  if (!bounds) return false;

  const padding = 10;
  return (
    p.x >= bounds.left - padding &&
    p.x <= bounds.right + padding &&
    p.y >= bounds.top - padding &&
    p.y <= bounds.bottom + padding
  );
}

/**
 * Start moving multiple objects
 */
function startMultiMove(p) {
  // Store original positions for each object
  selectedObjects.forEach((obj) => {
    if (
      obj.type === "text" ||
      obj.type === "image" ||
      obj.type === "signature-image" ||
      obj.type === "stamp"
    ) {
      obj._origX = obj.x;
      obj._origY = obj.y;
    } else if (obj.type === "shape") {
      obj._origStartX = obj.startX;
      obj._origStartY = obj.startY;
      obj._origEndX = obj.endX;
      obj._origEndY = obj.endY;
    } else if (obj.points && obj.points.length > 0) {
      obj._origPts = obj.points.map((pt) => ({ x: pt.x, y: pt.y }));
    }
  });

  return {
    mode: "movingMultiple",
    dragStartPos: p,
  };
}

/**
 * Update multi-move during drag
 */
function updateMultiMove(canvas, pageIndex, state, currentPos) {
  const dx = (currentPos.x - state.dragStartPos.x) / canvas.width;
  const dy = (currentPos.y - state.dragStartPos.y) / canvas.height;

  selectedObjects.forEach((obj) => {
    if (
      obj.type === "text" ||
      obj.type === "image" ||
      obj.type === "signature-image" ||
      obj.type === "stamp"
    ) {
      obj.x = obj._origX + dx;
      obj.y = obj._origY + dy;
    } else if (obj.type === "shape") {
      obj.startX = obj._origStartX + dx;
      obj.startY = obj._origStartY + dy;
      obj.endX = obj._origEndX + dx;
      obj.endY = obj._origEndY + dy;
    } else if (obj.points && obj._origPts) {
      obj.points = obj._origPts.map((pt) => ({
        x: pt.x + dx,
        y: pt.y + dy,
      }));
    }
  });

  const ctx = canvas.getContext("2d");
  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
}

/**
 * Finish multi-move and clean up temp properties
 */
function finishMultiMove() {
  selectedObjects.forEach((obj) => {
    delete obj._origX;
    delete obj._origY;
    delete obj._origStartX;
    delete obj._origStartY;
    delete obj._origEndX;
    delete obj._origEndY;
    delete obj._origPts;
  });
}

/**
 * Start resizing multiple objects
 */
function startMultiResize(p, handle, canvas) {
  const bounds = getMultiObjectBounds(selectedObjects, canvas);

  // Store original properties for each object
  selectedObjects.forEach((obj) => {
    if (obj.type === "text") {
      obj._origProps = { x: obj.x, y: obj.y, fontSize: obj.fontSize };
    } else if (
      obj.type === "image" ||
      obj.type === "signature-image" ||
      obj.type === "stamp"
    ) {
      obj._origProps = {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
      };
    } else if (obj.type === "shape") {
      obj._origProps = {
        startX: obj.startX,
        startY: obj.startY,
        endX: obj.endX,
        endY: obj.endY,
      };
    } else if (obj.points && obj.points.length > 0) {
      obj._origProps = {
        points: obj.points.map((pt) => ({ x: pt.x, y: pt.y })),
      };
    }
  });

  return {
    mode: "resizingMultiple",
    resizeHandle: handle,
    dragStartPos: p,
    originalBounds: {
      minX: bounds.left / canvas.width,
      minY: bounds.top / canvas.height,
      maxX: bounds.right / canvas.width,
      maxY: bounds.bottom / canvas.height,
    },
  };
}

/**
 * Update multi-resize during drag
 */
function updateMultiResize(canvas, pageIndex, state, currentPos) {
  const ctx = canvas.getContext("2d");
  const dx = (currentPos.x - state.dragStartPos.x) / canvas.width;
  const dy = (currentPos.y - state.dragStartPos.y) / canvas.height;
  const handle = state.resizeHandle;

  const origW = state.originalBounds.maxX - state.originalBounds.minX;
  const origH = state.originalBounds.maxY - state.originalBounds.minY;

  // Calculate scale factors
  let scaleX = 1,
    scaleY = 1;

  if (handle === "br") {
    scaleX = Math.max(0.1, (origW + dx) / origW);
    scaleY = Math.max(0.1, (origH + dy) / origH);
  } else if (handle === "bl") {
    scaleX = Math.max(0.1, (origW - dx) / origW);
    scaleY = Math.max(0.1, (origH + dy) / origH);
  } else if (handle === "tr") {
    scaleX = Math.max(0.1, (origW + dx) / origW);
    scaleY = Math.max(0.1, (origH - dy) / origH);
  } else if (handle === "tl") {
    scaleX = Math.max(0.1, (origW - dx) / origW);
    scaleY = Math.max(0.1, (origH - dy) / origH);
  } else if (handle === "r") {
    scaleX = Math.max(0.1, (origW + dx) / origW);
  } else if (handle === "l") {
    scaleX = Math.max(0.1, (origW - dx) / origW);
  } else if (handle === "b") {
    scaleY = Math.max(0.1, (origH + dy) / origH);
  } else if (handle === "t") {
    scaleY = Math.max(0.1, (origH - dy) / origH);
  }

  // Apply scale to each object
  selectedObjects.forEach((obj) => {
    if (!obj._origProps) return;

    if (obj.type === "text") {
      const avgScale = (scaleX + scaleY) / 2;
      obj.fontSize = obj._origProps.fontSize * avgScale;
      ctx.font = `${obj.fontSize * canvas.height}px Arial`;
      obj.width = ctx.measureText(obj.text).width / canvas.width;
      obj.x = obj._origProps.x;
      obj.y = obj._origProps.y;
    } else if (
      obj.type === "image" ||
      obj.type === "signature-image" ||
      obj.type === "stamp"
    ) {
      obj.width = obj._origProps.width * scaleX;
      obj.height = obj._origProps.height * scaleY;
      obj.x = obj._origProps.x;
      obj.y = obj._origProps.y;
    } else if (obj.type === "shape") {
      const origCenterX = (obj._origProps.startX + obj._origProps.endX) / 2;
      const origCenterY = (obj._origProps.startY + obj._origProps.endY) / 2;

      obj.startX = origCenterX + (obj._origProps.startX - origCenterX) * scaleX;
      obj.startY = origCenterY + (obj._origProps.startY - origCenterY) * scaleY;
      obj.endX = origCenterX + (obj._origProps.endX - origCenterX) * scaleX;
      obj.endY = origCenterY + (obj._origProps.endY - origCenterY) * scaleY;
    } else if (obj.points && obj._origProps.points) {
      let centerX = 0,
        centerY = 0;
      obj._origProps.points.forEach((pt) => {
        centerX += pt.x;
        centerY += pt.y;
      });
      centerX /= obj._origProps.points.length;
      centerY /= obj._origProps.points.length;

      obj.points = obj._origProps.points.map((pt) => ({
        x: centerX + (pt.x - centerX) * scaleX,
        y: centerY + (pt.y - centerY) * scaleY,
      }));
    }
  });

  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
}

/**
 * Finish multi-resize and clean up temp properties
 */
function finishMultiResize() {
  selectedObjects.forEach((obj) => {
    delete obj._origProps;
  });
}

/**
 * Clear multi-selection
 */
function clearMultiSelection() {
  selectedObjects = [];
}

/**
 * Set multi-selection
 */
function setMultiSelection(objects, pageIndex) {
  selectedObjects = objects;
  selectedPageIndex = objects.length > 0 ? pageIndex : null;

  // Clear individual selections when multi-selecting
  if (objects.length > 1) {
    selectedText = null;
    selectedImage = null;
    selectedShape = null;
    selectedStamp = null;
    selectedSignature = null;
    selectedStroke = null;
  }
}
