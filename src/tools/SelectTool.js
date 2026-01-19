// Select tool functionality - select and resize objects with multi-select support

// ========== HANDLE DETECTION FUNCTIONS ==========
function getHandleAtPosition(x, y, obj, canvas) {
  if (!obj) return null;
  const hitArea = 80;

  // Get bounding box based on object type
  let left, top, width, height;

  if (obj.type === "text") {
    const textX = obj.x * canvas.width;
    const textY = obj.y * canvas.height;
    const fontSize = obj.fontSize * canvas.height;
    const textWidth = obj.width * canvas.width;
    left = textX - 2;
    top = textY - fontSize;
    width = textWidth + 4;
    height = fontSize + 7;
  } else if (obj.type === "image" || obj.type === "signature-image") {
    left = obj.x * canvas.width;
    top = obj.y * canvas.height;
    width = obj.width * canvas.width;
    height = obj.height * canvas.height;
  } else if (obj.type === "stamp") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const w = obj.width * canvas.width;
    const h = obj.height * canvas.height;
    left = x - w / 2 - 5;
    top = y - h / 2 - 5;
    width = w + 10;
    height = h + 10;
  } else if (obj.type === "shape") {
    const startX = obj.startX * canvas.width;
    const startY = obj.startY * canvas.height;
    const endX = obj.endX * canvas.width;
    const endY = obj.endY * canvas.height;
    if (obj.shapeType === "circle") {
      const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      left = startX - radius - 5;
      top = startY - radius - 5;
      width = radius * 2 + 10;
      height = radius * 2 + 10;
    } else {
      left = Math.min(startX, endX) - 5;
      top = Math.min(startY, endY) - 5;
      width = Math.abs(endX - startX) + 10;
      height = Math.abs(endY - startY) + 10;
    }
  } else if (obj.points && obj.points.length > 0) {
    // Handle pen strokes (may not have a type property)
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
    left = minX - 5;
    top = minY - 5;
    width = maxX - minX + 10;
    height = maxY - minY + 10;
  } else {
    return null;
  }

  // Check all 8 handles
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

function getObjectBounds(obj, canvas) {
  if (!obj) return null;
  if (obj.type === "text") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const fontSize = obj.fontSize * canvas.height;
    const width = obj.width * canvas.width;
    return { left: x, top: y - fontSize, right: x + width, bottom: y };
  } else if (obj.type === "image" || obj.type === "signature-image") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    return {
      left: x,
      top: y,
      right: x + obj.width * canvas.width,
      bottom: y + obj.height * canvas.height,
    };
  } else if (obj.type === "shape") {
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
  } else if (obj.type === "stamp") {
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
  } else if (obj.points && obj.points.length > 0) {
    // Handle pen strokes and highlights (may not have a type property, or type is "pen"/"highlight")
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
  return !(
    bounds.right < boxLeft ||
    bounds.left > boxRight ||
    bounds.bottom < boxTop ||
    bounds.top > boxBottom
  );
}

// ========== MAIN SELECT FUNCTIONS ==========
function handleSelectStart(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);

  const clickedText = checkTextClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedImage = checkImageClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedShape = checkShapeClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedStamp = checkStampClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedSignature = checkSignatureClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedPenStroke = checkPenStrokeClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedObject =
    clickedText ||
    clickedImage ||
    clickedShape ||
    clickedStamp ||
    clickedSignature ||
    clickedPenStroke;

  // Multi-select mode
  if (selectedObjects.length > 1) {
    // Check for resize handle on unified bounding box
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    selectedObjects.forEach((obj) => {
      const bounds = getObjectBounds(obj, canvas);
      if (bounds) {
        minX = Math.min(minX, bounds.left);
        minY = Math.min(minY, bounds.top);
        maxX = Math.max(maxX, bounds.right);
        maxY = Math.max(maxY, bounds.bottom);
      }
    });

    const padding = 10;
    const boxLeft = minX - padding;
    const boxTop = minY - padding;
    const boxWidth = maxX - minX + padding * 2;
    const boxHeight = maxY - minY + padding * 2;
    const hitArea = 80;

    // Check for handle clicks
    let handle = null;
    if (Math.abs(p.x - boxLeft) < hitArea && Math.abs(p.y - boxTop) < hitArea)
      handle = "tl";
    else if (
      Math.abs(p.x - (boxLeft + boxWidth)) < hitArea &&
      Math.abs(p.y - boxTop) < hitArea
    )
      handle = "tr";
    else if (
      Math.abs(p.x - boxLeft) < hitArea &&
      Math.abs(p.y - (boxTop + boxHeight)) < hitArea
    )
      handle = "bl";
    else if (
      Math.abs(p.x - (boxLeft + boxWidth)) < hitArea &&
      Math.abs(p.y - (boxTop + boxHeight)) < hitArea
    )
      handle = "br";
    else if (
      Math.abs(p.x - (boxLeft + boxWidth / 2)) < hitArea &&
      Math.abs(p.y - boxTop) < hitArea
    )
      handle = "t";
    else if (
      Math.abs(p.x - (boxLeft + boxWidth / 2)) < hitArea &&
      Math.abs(p.y - (boxTop + boxHeight)) < hitArea
    )
      handle = "b";
    else if (
      Math.abs(p.x - boxLeft) < hitArea &&
      Math.abs(p.y - (boxTop + boxHeight / 2)) < hitArea
    )
      handle = "l";
    else if (
      Math.abs(p.x - (boxLeft + boxWidth)) < hitArea &&
      Math.abs(p.y - (boxTop + boxHeight / 2)) < hitArea
    )
      handle = "r";

    if (handle) {
      return {
        resizingMultiple: true,
        resizeHandle: handle,
        dragStartPos: p,
        originalBounds: {
          minX: minX / canvas.width,
          minY: minY / canvas.height,
          maxX: maxX / canvas.width,
          maxY: maxY / canvas.height,
        },
      };
    }

    // Check if clicking inside the selection box (including whitespace)
    const clickedInsideBox =
      p.x >= boxLeft &&
      p.x <= boxLeft + boxWidth &&
      p.y >= boxTop &&
      p.y <= boxTop + boxHeight;

    if (clickedInsideBox) {
      // Click anywhere inside the box to move the entire selection
      return { mode: "movingMultiple", dragStartPos: p };
    }

    if (clickedObject) {
      // Clicking a different object outside the box - switch to single select
      selectedObjects = [];
      selectedText = clickedText;
      selectedImage = clickedImage;
      selectedShape = clickedShape;
      selectedStamp = clickedStamp;
      selectedSignature = clickedSignature;
      selectedStroke = clickedPenStroke;
      selectedPageIndex = pageIndex;
      redrawStrokes(
        canvas.getContext("2d"),
        pageIndex,
        canvas.width,
        canvas.height
      );
      return {};
    } else {
      // Clicking empty space outside the box - clear selection and start drag box
      selectedObjects = [];
      selectedText = null;
      selectedImage = null;
      selectedShape = null;
      selectedStamp = null;
      selectedSignature = null;
      selectedStroke = null;
      selectedPageIndex = null;
      redrawStrokes(
        canvas.getContext("2d"),
        pageIndex,
        canvas.width,
        canvas.height
      );
      return { mode: "dragBox", dragStartPos: p };
    }
  }

  if (selectedObjects.length > 0) {
    if (clickedObject && selectedObjects.includes(clickedObject)) {
      return { mode: "movingMultiple", dragStartPos: p };
    }
    if (clickedObject) {
      // Clicking a different object - switch to single select
      selectedObjects = [];
      selectedText = clickedText;
      selectedImage = clickedImage;
      selectedShape = clickedShape;
      selectedStamp = clickedStamp;
      selectedSignature = clickedSignature;
      selectedStroke = clickedPenStroke;
      selectedPageIndex = pageIndex;
      redrawStrokes(
        canvas.getContext("2d"),
        pageIndex,
        canvas.width,
        canvas.height
      );
      return {};
    } else {
      // Clicking empty space - clear selection and start drag box
      selectedObjects = [];
      selectedText = null;
      selectedImage = null;
      selectedShape = null;
      selectedStamp = null;
      selectedSignature = null;
      selectedStroke = null;
      selectedPageIndex = null;
      redrawStrokes(
        canvas.getContext("2d"),
        pageIndex,
        canvas.width,
        canvas.height
      );
      return { mode: "dragBox", dragStartPos: p };
    }
  }

  // Check for resize handle on single selected object
  const currentSelected =
    selectedText ||
    selectedImage ||
    selectedShape ||
    selectedStamp ||
    selectedSignature ||
    selectedStroke;
  if (currentSelected === clickedObject && clickedObject) {
    const handle = getHandleAtPosition(p.x, p.y, currentSelected, canvas);
    if (handle) {
      return {
        resizing: true,
        resizeHandle: handle,
        dragStartPos: p,
        resizeObject: currentSelected,
      };
    }
  }

  // Select object
  if (clickedObject) {
    selectedText = clickedText;
    selectedImage = clickedImage;
    selectedShape = clickedShape;
    selectedStamp = clickedStamp;
    selectedSignature = clickedSignature;
    selectedStroke = clickedPenStroke;
    selectedPageIndex = pageIndex;
    selectedObjects = [];
    redrawStrokes(
      canvas.getContext("2d"),
      pageIndex,
      canvas.width,
      canvas.height
    );
    return {};
  }

  // Start drag box
  selectedText = null;
  selectedImage = null;
  selectedShape = null;
  selectedStamp = null;
  selectedSignature = null;
  selectedStroke = null;
  selectedPageIndex = null;
  return { mode: "dragBox", dragStartPos: p };
}

function handleSelectMove(e, canvas, pageIndex, state) {
  const p = getCanvasPosition(e, canvas);
  const ctx = canvas.getContext("2d");

  // Drag box
  if (state.mode === "dragBox") {
    const left = Math.min(state.dragStartPos.x, p.x);
    const top = Math.min(state.dragStartPos.y, p.y);
    const width = Math.abs(p.x - state.dragStartPos.x);
    const height = Math.abs(p.y - state.dragStartPos.y);
    redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
    ctx.strokeStyle = "#2196F3";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(left, top, width, height);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(33, 150, 243, 0.1)";
    ctx.fillRect(left, top, width, height);
    return { ...state, currentPos: p };
  }

  // Resize multiple objects
  if (state.resizingMultiple && selectedObjects && selectedObjects.length > 1) {
    const dx = (p.x - state.dragStartPos.x) / canvas.width;
    const dy = (p.y - state.dragStartPos.y) / canvas.height;
    const handle = state.resizeHandle;
    const origW = state.originalBounds.maxX - state.originalBounds.minX;
    const origH = state.originalBounds.maxY - state.originalBounds.minY;

    let scaleX = 1,
      scaleY = 1;
    let anchorX, anchorY;

    // Calculate scale and anchor point based on handle
    // Anchor is the opposite corner/edge from the handle being dragged
    if (handle === "br") {
      scaleX = Math.max(0.1, (origW + dx) / origW);
      scaleY = Math.max(0.1, (origH + dy) / origH);
      anchorX = state.originalBounds.minX; // Top-left anchor
      anchorY = state.originalBounds.minY;
    } else if (handle === "bl") {
      scaleX = Math.max(0.1, (origW - dx) / origW);
      scaleY = Math.max(0.1, (origH + dy) / origH);
      anchorX = state.originalBounds.maxX; // Top-right anchor
      anchorY = state.originalBounds.minY;
    } else if (handle === "tr") {
      scaleX = Math.max(0.1, (origW + dx) / origW);
      scaleY = Math.max(0.1, (origH - dy) / origH);
      anchorX = state.originalBounds.minX; // Bottom-left anchor
      anchorY = state.originalBounds.maxY;
    } else if (handle === "tl") {
      scaleX = Math.max(0.1, (origW - dx) / origW);
      scaleY = Math.max(0.1, (origH - dy) / origH);
      anchorX = state.originalBounds.maxX; // Bottom-right anchor
      anchorY = state.originalBounds.maxY;
    } else if (handle === "r") {
      scaleX = Math.max(0.1, (origW + dx) / origW);
      anchorX = state.originalBounds.minX; // Left edge anchor
      anchorY = state.originalBounds.minY;
    } else if (handle === "l") {
      scaleX = Math.max(0.1, (origW - dx) / origW);
      anchorX = state.originalBounds.maxX; // Right edge anchor
      anchorY = state.originalBounds.minY;
    } else if (handle === "b") {
      scaleY = Math.max(0.1, (origH + dy) / origH);
      anchorX = state.originalBounds.minX;
      anchorY = state.originalBounds.minY; // Top edge anchor
    } else if (handle === "t") {
      scaleY = Math.max(0.1, (origH - dy) / origH);
      anchorX = state.originalBounds.minX;
      anchorY = state.originalBounds.maxY; // Bottom edge anchor
    }

    // Store original properties on first resize
    selectedObjects.forEach((obj) => {
      if (!obj._origProps) {
        if (obj.type === "text") {
          obj._origProps = {
            x: obj.x,
            y: obj.y,
            fontSize: obj.fontSize,
            width: obj.width,
          };
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
      }
    });

    // Scale each object relative to the unified bounding box anchor
    selectedObjects.forEach((obj) => {
      if (obj.type === "text") {
        // Scale text position and fontSize relative to anchor
        const avgScale = (scaleX + scaleY) / 2;
        obj.fontSize = obj._origProps.fontSize * avgScale;
        obj.x = anchorX + (obj._origProps.x - anchorX) * scaleX;
        obj.y = anchorY + (obj._origProps.y - anchorY) * scaleY;
        // Recalculate width based on new fontSize
        ctx.font = `${obj.fontSize * canvas.height}px Arial`;
        obj.width = ctx.measureText(obj.text).width / canvas.width;
      } else if (obj.type === "image" || obj.type === "signature-image") {
        // Scale image position and dimensions relative to anchor
        obj.x = anchorX + (obj._origProps.x - anchorX) * scaleX;
        obj.y = anchorY + (obj._origProps.y - anchorY) * scaleY;
        obj.width = obj._origProps.width * scaleX;
        obj.height = obj._origProps.height * scaleY;
      } else if (obj.type === "stamp") {
        // Stamps are centered, so scale center position and dimensions
        obj.x = anchorX + (obj._origProps.x - anchorX) * scaleX;
        obj.y = anchorY + (obj._origProps.y - anchorY) * scaleY;
        obj.width = obj._origProps.width * scaleX;
        obj.height = obj._origProps.height * scaleY;
      } else if (obj.type === "shape") {
        // Scale shape endpoints relative to anchor
        obj.startX = anchorX + (obj._origProps.startX - anchorX) * scaleX;
        obj.startY = anchorY + (obj._origProps.startY - anchorY) * scaleY;
        obj.endX = anchorX + (obj._origProps.endX - anchorX) * scaleX;
        obj.endY = anchorY + (obj._origProps.endY - anchorY) * scaleY;
      } else if (obj.points && obj.points.length > 0) {
        // Scale pen stroke points relative to anchor
        obj.points = obj._origProps.points.map((pt) => ({
          x: anchorX + (pt.x - anchorX) * scaleX,
          y: anchorY + (pt.y - anchorY) * scaleY,
        }));
      }
    });

    redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
    return state;
  }

  // Move multiple
  if (state.mode === "movingMultiple" && selectedObjects.length > 0) {
    const dx = (p.x - state.dragStartPos.x) / canvas.width;
    const dy = (p.y - state.dragStartPos.y) / canvas.height;
    selectedObjects.forEach((obj) => {
      if (
        obj.type === "text" ||
        obj.type === "image" ||
        obj.type === "signature-image" ||
        obj.type === "stamp"
      ) {
        if (!obj._origX) obj._origX = obj.x;
        if (!obj._origY) obj._origY = obj.y;
        obj.x = obj._origX + dx;
        obj.y = obj._origY + dy;
      } else if (obj.type === "shape") {
        if (!obj._origStartX) {
          obj._origStartX = obj.startX;
          obj._origStartY = obj.startY;
          obj._origEndX = obj.endX;
          obj._origEndY = obj.endY;
        }
        obj.startX = obj._origStartX + dx;
        obj.startY = obj._origStartY + dy;
        obj.endX = obj._origEndX + dx;
        obj.endY = obj._origEndY + dy;
      } else if (obj.points && obj.points.length > 0) {
        // Handle pen strokes (may not have type property)
        if (!obj._origPts)
          obj._origPts = obj.points.map((pt) => ({ x: pt.x, y: pt.y }));
        obj.points = obj._origPts.map((pt) => ({ x: pt.x + dx, y: pt.y + dy }));
      }
    });
    redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
    return state;
  }

  // Resize single object
  if (state.resizing && state.resizeObject) {
    const obj = state.resizeObject;
    const dx = (p.x - state.dragStartPos.x) / canvas.width;
    const dy = (p.y - state.dragStartPos.y) / canvas.height;
    const handle = state.resizeHandle;

    if (obj.type === "text") {
      if (!obj._origFontSize) {
        obj._origFontSize = obj.fontSize;
        obj._origY = obj.y;
      }
      let newFontSize = obj._origFontSize;
      if (handle.includes("t")) {
        newFontSize = obj._origFontSize - dy;
        obj.y = obj._origY + dy;
      } else if (handle.includes("b")) {
        newFontSize = obj._origFontSize + dy;
      }
      newFontSize = Math.max(
        8 / canvas.height,
        Math.min(200 / canvas.height, newFontSize)
      );
      obj.fontSize = newFontSize;
      ctx.font = `${newFontSize * canvas.height}px Arial`;
      obj.width = ctx.measureText(obj.text).width / canvas.width;
    } else if (obj.type === "image" || obj.type === "signature-image") {
      // Images use top-left corner positioning
      if (!obj._origX) {
        obj._origX = obj.x;
        obj._origY = obj.y;
        obj._origW = obj.width;
        obj._origH = obj.height;
      }
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
    } else if (obj.type === "stamp") {
      // Stamps use CENTER positioning - resize around center
      if (!obj._origX) {
        obj._origX = obj.x;
        obj._origY = obj.y;
        obj._origW = obj.width;
        obj._origH = obj.height;
      }
      const aspectRatio = obj._origW / obj._origH;
      let newW = obj._origW,
        newH = obj._origH;

      // For stamps, we scale from center - position stays the same
      // Corner handles scale proportionally
      if (handle === "br" || handle === "tr") {
        newW = obj._origW + dx * 2; // *2 because we're scaling from center
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
        // Center position stays the same for stamps
        obj.width = newW;
        obj.height = newH;
      }
    } else if (obj.type === "shape") {
      if (!obj._origStartX) {
        obj._origStartX = obj.startX;
        obj._origStartY = obj.startY;
        obj._origEndX = obj.endX;
        obj._origEndY = obj.endY;
      }
      let newStartX = obj._origStartX,
        newStartY = obj._origStartY,
        newEndX = obj._origEndX,
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
    } else if (obj.points && obj.points.length > 0) {
      // Handle pen strokes (may not have type property)
      if (!obj._origPts) {
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

    redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
    return state;
  }

  return state;
}

function handleSelectStop(canvas, pageIndex, state) {
  const ctx = canvas.getContext("2d");

  if (state.mode === "dragBox" && state.currentPos) {
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

    selectedObjects = selected;
    selectedPageIndex = selected.length > 0 ? pageIndex : null;
    if (selected.length > 1) {
      selectedText = null;
      selectedImage = null;
      selectedShape = null;
      selectedStamp = null;
      selectedSignature = null;
      selectedStroke = null;
    }
    redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
  }

  // Clean up temp properties
  if (state.mode === "movingMultiple" && selectedObjects) {
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

  if (state.resizingMultiple && selectedObjects) {
    selectedObjects.forEach((obj) => {
      delete obj._origProps;
    });
  }

  if (state.resizing && state.resizeObject) {
    const obj = state.resizeObject;
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

  return {
    resizing: false,
    resizingMultiple: false,
    dragStartPos: null,
    resizeHandle: null,
    resizeObject: null,
  };
}
