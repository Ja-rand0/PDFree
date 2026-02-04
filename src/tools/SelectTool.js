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
      let radiusX, radiusY;
      if (obj.radiusX !== undefined && obj.radiusY !== undefined) {
        radiusX = obj.radiusX * canvas.width;
        radiusY = obj.radiusY * canvas.height;
      } else {
        const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        radiusX = radius;
        radiusY = radius;
      }
      left = startX - Math.abs(radiusX) - 5;
      top = startY - Math.abs(radiusY) - 5;
      width = Math.abs(radiusX) * 2 + 10;
      height = Math.abs(radiusY) * 2 + 10;
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

  // Check all 8 handles - corners first (higher priority)
  // Scale hit area based on object size - smaller objects get smaller hit areas
  const minDim = Math.min(width, height);
  const cornerHit = Math.min(hitArea, minDim / 3);
  const edgeHit = Math.min(hitArea, minDim / 3);

  // Corner handles
  if (Math.abs(x - left) < cornerHit && Math.abs(y - top) < cornerHit) return "tl";
  if (Math.abs(x - (left + width)) < cornerHit && Math.abs(y - top) < cornerHit)
    return "tr";
  if (Math.abs(x - left) < cornerHit && Math.abs(y - (top + height)) < cornerHit)
    return "bl";
  if (
    Math.abs(x - (left + width)) < cornerHit &&
    Math.abs(y - (top + height)) < cornerHit
  )
    return "br";

  // Edge handles - check if within edge hit area AND along the edge
  // For small objects, reduce the corner exclusion zone
  const cornerExclude = Math.min(cornerHit, minDim / 4);

  // Top edge: close to top, and between left and right corners
  if (
    Math.abs(y - top) < edgeHit &&
    x > left + cornerExclude &&
    x < left + width - cornerExclude
  )
    return "t";
  // Bottom edge
  if (
    Math.abs(y - (top + height)) < edgeHit &&
    x > left + cornerExclude &&
    x < left + width - cornerExclude
  )
    return "b";
  // Left edge
  if (
    Math.abs(x - left) < edgeHit &&
    y > top + cornerExclude &&
    y < top + height - cornerExclude
  )
    return "l";
  // Right edge
  if (
    Math.abs(x - (left + width)) < edgeHit &&
    y > top + cornerExclude &&
    y < top + height - cornerExclude
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
      let radiusX, radiusY;
      if (obj.radiusX !== undefined && obj.radiusY !== undefined) {
        radiusX = obj.radiusX * canvas.width;
        radiusY = obj.radiusY * canvas.height;
      } else {
        const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        radiusX = radius;
        radiusY = radius;
      }
      return {
        left: startX - Math.abs(radiusX),
        top: startY - Math.abs(radiusY),
        right: startX + Math.abs(radiusX),
        bottom: startY + Math.abs(radiusY),
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
  } else if (obj.type === "checkbox") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const size = obj.size * canvas.width;
    return {
      left: x,
      top: y,
      right: x + size,
      bottom: y + size,
    };
  } else if (obj.type === "datestamp") {
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
  } else if (obj.type === "textfield") {
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
  } else if (obj.type === "comment") {
    const x = obj.x * canvas.width;
    const y = obj.y * canvas.height;
    const iconSize = 30;
    return {
      left: x,
      top: y,
      right: x + iconSize,
      bottom: y + iconSize,
    };
  } else if (obj.type === "watermark") {
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
  } else if (obj.type === "measurement") {
    if (obj.measureType === "distance") {
      const x1 = obj.startX * canvas.width;
      const y1 = obj.startY * canvas.height;
      const x2 = obj.endX * canvas.width;
      const y2 = obj.endY * canvas.height;
      return {
        left: Math.min(x1, x2),
        top: Math.min(y1, y2),
        right: Math.max(x1, x2),
        bottom: Math.max(y1, y2),
      };
    } else if (obj.measureType === "area" && obj.points) {
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
  } else if (obj.type === "redaction") {
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
  const clickedCheckbox = checkCheckboxClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedDateStamp = checkDateStampClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedTextField = checkTextFieldClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedComment = checkCommentClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedWatermark = checkWatermarkClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedMeasurement = checkMeasurementClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );
  const clickedRedaction = checkRedactionClick(
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
    clickedPenStroke ||
    clickedCheckbox ||
    clickedDateStamp ||
    clickedTextField ||
    clickedComment ||
    clickedWatermark ||
    clickedMeasurement ||
    clickedRedaction;

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
    // Check for resize handle on single selected object in selectedObjects array
    if (selectedObjects.length === 1) {
      const singleObj = selectedObjects[0];
      const bounds = getObjectBounds(singleObj, canvas);
      if (bounds) {
        const padding = 10;
        const boxLeft = bounds.left - padding;
        const boxTop = bounds.top - padding;
        const boxWidth = bounds.right - bounds.left + padding * 2;
        const boxHeight = bounds.bottom - bounds.top + padding * 2;

        // Scale hit area based on object size
        const minDim = Math.min(boxWidth, boxHeight);
        const hitArea = Math.min(80, minDim / 3);

        // Check for handle clicks
        let handle = null;
        if (Math.abs(p.x - boxLeft) < hitArea && Math.abs(p.y - boxTop) < hitArea)
          handle = "tl";
        else if (Math.abs(p.x - (boxLeft + boxWidth)) < hitArea && Math.abs(p.y - boxTop) < hitArea)
          handle = "tr";
        else if (Math.abs(p.x - boxLeft) < hitArea && Math.abs(p.y - (boxTop + boxHeight)) < hitArea)
          handle = "bl";
        else if (Math.abs(p.x - (boxLeft + boxWidth)) < hitArea && Math.abs(p.y - (boxTop + boxHeight)) < hitArea)
          handle = "br";
        else if (Math.abs(p.x - (boxLeft + boxWidth / 2)) < hitArea && Math.abs(p.y - boxTop) < hitArea)
          handle = "t";
        else if (Math.abs(p.x - (boxLeft + boxWidth / 2)) < hitArea && Math.abs(p.y - (boxTop + boxHeight)) < hitArea)
          handle = "b";
        else if (Math.abs(p.x - boxLeft) < hitArea && Math.abs(p.y - (boxTop + boxHeight / 2)) < hitArea)
          handle = "l";
        else if (Math.abs(p.x - (boxLeft + boxWidth)) < hitArea && Math.abs(p.y - (boxTop + boxHeight / 2)) < hitArea)
          handle = "r";

        if (handle) {
          return {
            resizingMultiple: true,
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
      }
    }

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
    // If clicking on a text field, prompt for text input
    if (clickedTextField) {
      const newText = prompt("Enter text for field:", clickedTextField.text || "");
      if (newText !== null) {
        clickedTextField.text = newText;
        redrawStrokes(
          canvas.getContext("2d"),
          pageIndex,
          canvas.width,
          canvas.height
        );
      }
    }

    selectedText = clickedText;
    selectedImage = clickedImage;
    selectedShape = clickedShape;
    selectedStamp = clickedStamp;
    selectedSignature = clickedSignature;
    selectedStroke = clickedPenStroke;
    selectedPageIndex = pageIndex;

    // For newer object types without dedicated selection variables,
    // use selectedObjects array for single selection too
    if (clickedCheckbox || clickedDateStamp || clickedTextField || clickedComment || clickedWatermark || clickedMeasurement || clickedRedaction) {
      selectedObjects = [clickedObject];
    } else {
      selectedObjects = [];
    }

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
        } else if (obj.type === "checkbox") {
          obj._origProps = {
            x: obj.x,
            y: obj.y,
            size: obj.size,
          };
        } else if (obj.type === "datestamp") {
          obj._origProps = {
            x: obj.x,
            y: obj.y,
            fontSize: obj.fontSize,
          };
        } else if (obj.type === "textfield") {
          obj._origProps = {
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
            fontSize: obj.fontSize,
          };
        } else if (obj.type === "comment") {
          obj._origProps = {
            x: obj.x,
            y: obj.y,
          };
        } else if (obj.type === "watermark") {
          obj._origProps = {
            x: obj.x,
            y: obj.y,
            fontSize: obj.fontSize,
          };
        } else if (obj.type === "redaction") {
          obj._origProps = {
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
          };
        } else if (obj.type === "measurement") {
          if (obj.measureType === "distance") {
            obj._origProps = {
              startX: obj.startX,
              startY: obj.startY,
              endX: obj.endX,
              endY: obj.endY,
            };
          } else if (obj.measureType === "area" && obj.points) {
            obj._origProps = {
              points: obj.points.map((pt) => ({ x: pt.x, y: pt.y })),
            };
          }
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
      } else if (obj.type === "checkbox") {
        // Scale checkbox position and size relative to anchor
        const avgScale = (scaleX + scaleY) / 2;
        obj.x = anchorX + (obj._origProps.x - anchorX) * scaleX;
        obj.y = anchorY + (obj._origProps.y - anchorY) * scaleY;
        obj.size = obj._origProps.size * avgScale;
      } else if (obj.type === "datestamp") {
        // Scale datestamp position and font size relative to anchor
        const avgScale = (scaleX + scaleY) / 2;
        obj.x = anchorX + (obj._origProps.x - anchorX) * scaleX;
        obj.y = anchorY + (obj._origProps.y - anchorY) * scaleY;
        obj.fontSize = obj._origProps.fontSize * avgScale;
      } else if (obj.type === "textfield") {
        // Scale textfield position, dimensions, and font size relative to anchor
        const avgScale = (scaleX + scaleY) / 2;
        obj.x = anchorX + (obj._origProps.x - anchorX) * scaleX;
        obj.y = anchorY + (obj._origProps.y - anchorY) * scaleY;
        obj.width = obj._origProps.width * scaleX;
        obj.height = obj._origProps.height * scaleY;
        obj.fontSize = obj._origProps.fontSize * avgScale;
      } else if (obj.type === "comment") {
        // Scale comment position relative to anchor
        obj.x = anchorX + (obj._origProps.x - anchorX) * scaleX;
        obj.y = anchorY + (obj._origProps.y - anchorY) * scaleY;
      } else if (obj.type === "watermark") {
        // Scale watermark position and font size relative to anchor
        const avgScale = (scaleX + scaleY) / 2;
        obj.x = anchorX + (obj._origProps.x - anchorX) * scaleX;
        obj.y = anchorY + (obj._origProps.y - anchorY) * scaleY;
        obj.fontSize = obj._origProps.fontSize * avgScale;
      } else if (obj.type === "redaction") {
        // Scale redaction position and dimensions relative to anchor
        obj.x = anchorX + (obj._origProps.x - anchorX) * scaleX;
        obj.y = anchorY + (obj._origProps.y - anchorY) * scaleY;
        obj.width = obj._origProps.width * scaleX;
        obj.height = obj._origProps.height * scaleY;
      } else if (obj.type === "measurement") {
        // Scale measurement relative to anchor
        if (obj.measureType === "distance") {
          obj.startX = anchorX + (obj._origProps.startX - anchorX) * scaleX;
          obj.startY = anchorY + (obj._origProps.startY - anchorY) * scaleY;
          obj.endX = anchorX + (obj._origProps.endX - anchorX) * scaleX;
          obj.endY = anchorY + (obj._origProps.endY - anchorY) * scaleY;
        } else if (obj.measureType === "area" && obj._origProps.points) {
          obj.points = obj._origProps.points.map((pt) => ({
            x: anchorX + (pt.x - anchorX) * scaleX,
            y: anchorY + (pt.y - anchorY) * scaleY,
          }));
        }
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
        obj.type === "stamp" ||
        obj.type === "checkbox" ||
        obj.type === "datestamp" ||
        obj.type === "textfield" ||
        obj.type === "comment" ||
        obj.type === "watermark" ||
        obj.type === "redaction"
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
      } else if (obj.type === "measurement") {
        // Handle measurement objects
        if (obj.measureType === "distance") {
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
        } else if (obj.measureType === "area" && obj.points) {
          if (!obj._origPts)
            obj._origPts = obj.points.map((pt) => ({ x: pt.x, y: pt.y }));
          obj.points = obj._origPts.map((pt) => ({ x: pt.x + dx, y: pt.y + dy }));
        }
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
        obj._origX = obj.x;
      }

      // Calculate font size change based on drag direction
      let newFontSize = obj._origFontSize;
      if (handle.includes("t")) {
        newFontSize = obj._origFontSize - dy;
      } else if (handle.includes("b")) {
        newFontSize = obj._origFontSize + dy;
      }

      // Clamp font size
      newFontSize = Math.max(
        8 / canvas.height,
        Math.min(200 / canvas.height, newFontSize)
      );

      // ONLY change fontSize - position stays completely fixed
      obj.fontSize = newFontSize;
      obj.x = obj._origX;
      obj.y = obj._origY;

      // Recalculate width based on new font size
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
        // Bottom-right: anchor top-left
        newW = obj._origW + dx;
        newH = newW / aspectRatio;
      } else if (handle === "bl") {
        // Bottom-left: anchor top-right
        newW = obj._origW - dx;
        newH = newW / aspectRatio;
        newX = obj._origX + (obj._origW - newW);
      } else if (handle === "tr") {
        // Top-right: anchor bottom-left
        newW = obj._origW + dx;
        newH = newW / aspectRatio;
        newY = obj._origY + (obj._origH - newH);
      } else if (handle === "tl") {
        // Top-left: anchor bottom-right
        newW = obj._origW - dx;
        newH = newW / aspectRatio;
        newX = obj._origX + (obj._origW - newW);
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
        // Store original radii for circles/ellipses
        if (obj.shapeType === "circle") {
          if (obj.radiusX !== undefined && obj.radiusY !== undefined) {
            // Already has ellipse radii - store in PIXELS for consistent scaling
            obj._origRadiusXPx = obj.radiusX * canvas.width;
            obj._origRadiusYPx = obj.radiusY * canvas.height;
          } else {
            // Circle defined by center + edge point - compute radius in pixels
            const radiusPixels = Math.sqrt(
              (obj.endX * canvas.width - obj.startX * canvas.width) ** 2 +
              (obj.endY * canvas.height - obj.startY * canvas.height) ** 2
            );
            obj._origRadiusXPx = radiusPixels;
            obj._origRadiusYPx = radiusPixels;
          }
        }
      }

      if (obj.shapeType === "circle") {
        // Circle/Ellipse: center stays fixed, work in PIXELS
        let newRadiusXPx = obj._origRadiusXPx;
        let newRadiusYPx = obj._origRadiusYPx;

        // Convert dx/dy to pixels
        const dxPx = dx * canvas.width;
        const dyPx = dy * canvas.height;

        // Corner handles: uniform scaling (same pixel delta for both)
        if (handle === "br") {
          const delta = dxPx; // Use horizontal movement in pixels
          newRadiusXPx = obj._origRadiusXPx + delta;
          newRadiusYPx = obj._origRadiusYPx + delta;
        } else if (handle === "bl") {
          const delta = -dxPx;
          newRadiusXPx = obj._origRadiusXPx + delta;
          newRadiusYPx = obj._origRadiusYPx + delta;
        } else if (handle === "tr") {
          const delta = dxPx;
          newRadiusXPx = obj._origRadiusXPx + delta;
          newRadiusYPx = obj._origRadiusYPx + delta;
        } else if (handle === "tl") {
          const delta = -dxPx;
          newRadiusXPx = obj._origRadiusXPx + delta;
          newRadiusYPx = obj._origRadiusYPx + delta;
        } else if (handle === "r") {
          // Edge handles scale only one axis (for ellipse)
          newRadiusXPx = obj._origRadiusXPx + dxPx;
        } else if (handle === "l") {
          newRadiusXPx = obj._origRadiusXPx - dxPx;
        } else if (handle === "b") {
          newRadiusYPx = obj._origRadiusYPx + dyPx;
        } else if (handle === "t") {
          newRadiusYPx = obj._origRadiusYPx - dyPx;
        }

        // Ensure minimum size (10 pixels)
        newRadiusXPx = Math.max(10, newRadiusXPx);
        newRadiusYPx = Math.max(10, newRadiusYPx);

        // Center stays fixed
        obj.startX = obj._origStartX;
        obj.startY = obj._origStartY;
        // Convert back to normalized and store as radiusX/radiusY
        obj.radiusX = newRadiusXPx / canvas.width;
        obj.radiusY = newRadiusYPx / canvas.height;
        // Keep endX/endY for legacy compatibility
        obj.endX = obj._origStartX + obj.radiusX;
        obj.endY = obj._origStartY;
      } else {
        // Rectangle/line/arrow - keep original behavior
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
      }
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
    delete obj._origRadiusXPx;
    delete obj._origRadiusYPx;
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
