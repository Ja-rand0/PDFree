// HitDetection.js - Consolidated hit detection for all object types
// Used by: SelectTool, MultiSelectTool, MoveTool, DeleteTool, EraserTool

/**
 * Check if a click hits a text object
 */
function checkTextClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type === "text") {
      const textX = stroke.x * canvasWidth;
      const textY = stroke.y * canvasHeight;
      const fontSize = stroke.fontSize * canvasHeight;
      const textWidth = stroke.width * canvasWidth;

      if (
        x >= textX &&
        x <= textX + textWidth &&
        y >= textY - fontSize &&
        y <= textY + 5
      ) {
        return stroke;
      }
    }
  }
  return null;
}

/**
 * Check if a click hits an image object
 */
function checkImageClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type === "image") {
      const imgX = stroke.x * canvasWidth;
      const imgY = stroke.y * canvasHeight;
      const imgWidth = stroke.width * canvasWidth;
      const imgHeight = stroke.height * canvasHeight;

      if (
        x >= imgX &&
        x <= imgX + imgWidth &&
        y >= imgY &&
        y <= imgY + imgHeight
      ) {
        return stroke;
      }
    }
  }
  return null;
}

/**
 * Check if a click hits a shape object
 */
function checkShapeClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type === "shape") {
      const x1 = stroke.startX * canvasWidth;
      const y1 = stroke.startY * canvasHeight;
      const x2 = stroke.endX * canvasWidth;
      const y2 = stroke.endY * canvasHeight;

      let left, right, top, bottom;
      const hitMargin = 35;

      if (stroke.shapeType === "circle") {
        const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        left = x1 - radius;
        right = x1 + radius;
        top = y1 - radius;
        bottom = y1 + radius;
      } else {
        left = Math.min(x1, x2);
        right = Math.max(x1, x2);
        top = Math.min(y1, y2);
        bottom = Math.max(y1, y2);
      }

      if (
        x >= left - hitMargin &&
        x <= right + hitMargin &&
        y >= top - hitMargin &&
        y <= bottom + hitMargin
      ) {
        return stroke;
      }
    }
  }
  return null;
}

/**
 * Check if a click hits a stamp object
 */
function checkStampClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type === "stamp") {
      const stampX = stroke.x * canvasWidth;
      const stampY = stroke.y * canvasHeight;
      const stampWidth = stroke.width * canvasWidth;
      const stampHeight = stroke.height * canvasHeight;

      // Stamps are centered at x,y
      const left = stampX - stampWidth / 2;
      const right = stampX + stampWidth / 2;
      const top = stampY - stampHeight / 2;
      const bottom = stampY + stampHeight / 2;

      if (x >= left && x <= right && y >= top && y <= bottom) {
        return stroke;
      }
    }
  }
  return null;
}

/**
 * Check if a click hits a signature-image object
 */
function checkSignatureClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type === "signature-image") {
      const sigX = stroke.x * canvasWidth;
      const sigY = stroke.y * canvasHeight;
      const sigWidth = stroke.width * canvasWidth;
      const sigHeight = stroke.height * canvasHeight;

      if (
        x >= sigX &&
        x <= sigX + sigWidth &&
        y >= sigY &&
        y <= sigY + sigHeight
      ) {
        return stroke;
      }
    }
  }
  return null;
}

/**
 * Check if a click hits a pen stroke (or highlight)
 */
function checkPenStrokeClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];

    // Check if this is a pen/highlight stroke (has points but no specific type, or type is pen/highlight)
    if (stroke.points && stroke.points.length > 0) {
      // Skip if it's a different type with points (like signature drawings)
      if (stroke.type && stroke.type !== "pen" && stroke.type !== "highlight") {
        continue;
      }

      const hitDistance = 20;

      for (let j = 0; j < stroke.points.length; j++) {
        const point = stroke.points[j];
        const px = point.x * canvasWidth;
        const py = point.y * canvasHeight;

        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (distance <= hitDistance) {
          return stroke;
        }
      }
    }
  }
  return null;
}

/**
 * Check if a click hits any stroke with points (pen, highlight, signature)
 * Used by MoveTool and DeleteTool for general stroke detection
 */
function checkStrokeClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type !== "text" && stroke.points) {
      const hitDistance = 10;

      for (let j = 0; j < stroke.points.length; j++) {
        const point = stroke.points[j];
        const px = point.x * canvasWidth;
        const py = point.y * canvasHeight;

        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (distance <= hitDistance) {
          return stroke;
        }
      }
    }
  }
  return null;
}

/**
 * Check if a click hits ANY object - returns the first hit
 * Checks in order: text, image, shape, stamp, signature, pen stroke
 */
function checkAnyObjectClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  return (
    checkTextClick(pageIndex, x, y, canvasWidth, canvasHeight) ||
    checkImageClick(pageIndex, x, y, canvasWidth, canvasHeight) ||
    checkShapeClick(pageIndex, x, y, canvasWidth, canvasHeight) ||
    checkStampClick(pageIndex, x, y, canvasWidth, canvasHeight) ||
    checkSignatureClick(pageIndex, x, y, canvasWidth, canvasHeight) ||
    checkPenStrokeClick(pageIndex, x, y, canvasWidth, canvasHeight)
  );
}

/**
 * Get all objects hit at a point (for overlapping objects)
 */
function checkAllObjectsAtPoint(pageIndex, x, y, canvasWidth, canvasHeight) {
  const hits = [];

  const text = checkTextClick(pageIndex, x, y, canvasWidth, canvasHeight);
  if (text) hits.push(text);

  const image = checkImageClick(pageIndex, x, y, canvasWidth, canvasHeight);
  if (image) hits.push(image);

  const shape = checkShapeClick(pageIndex, x, y, canvasWidth, canvasHeight);
  if (shape) hits.push(shape);

  const stamp = checkStampClick(pageIndex, x, y, canvasWidth, canvasHeight);
  if (stamp) hits.push(stamp);

  const signature = checkSignatureClick(
    pageIndex,
    x,
    y,
    canvasWidth,
    canvasHeight
  );
  if (signature) hits.push(signature);

  const penStroke = checkPenStrokeClick(
    pageIndex,
    x,
    y,
    canvasWidth,
    canvasHeight
  );
  if (penStroke) hits.push(penStroke);

  return hits;
}
