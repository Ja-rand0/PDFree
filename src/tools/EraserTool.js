// Eraser tool functionality - traditional brush that erases as you drag

function handleEraserStart(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);

  // Start erasing immediately at the click point
  eraseAtPoint(pageIndex, p.x, p.y, 20, canvas.width, canvas.height);
  redrawStrokes(
    canvas.getContext("2d"),
    pageIndex,
    canvas.width,
    canvas.height
  );

  return {
    erasing: true,
    eraserRadius: 20,
  };
}

function handleEraserMove(e, canvas, pageIndex, state) {
  if (!state.erasing || currentTool !== "eraser") return state;

  const p = getCanvasPosition(e, canvas);

  // Erase at current point
  eraseAtPoint(
    pageIndex,
    p.x,
    p.y,
    state.eraserRadius,
    canvas.width,
    canvas.height
  );

  // Redraw everything
  const ctx = canvas.getContext("2d");
  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);

  // Draw eraser preview circle
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(p.x, p.y, state.eraserRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  return state;
}

function handleEraserStop(canvas, pageIndex, state) {
  if (!state.erasing) return { erasing: false, eraserRadius: 20 };

  // Final redraw without eraser preview
  redrawStrokes(
    canvas.getContext("2d"),
    pageIndex,
    canvas.width,
    canvas.height
  );

  return { erasing: false, eraserRadius: 20 };
}

function eraseAtPoint(pageIndex, x, y, radius, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return;

  // Process each stroke
  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];

    // Handle text objects - erase entirely when touched
    if (stroke.type === "text") {
      const textX = stroke.x * canvasWidth;
      const textY = stroke.y * canvasHeight;
      const fontSize = stroke.fontSize * canvasHeight;
      const textWidth = stroke.width * canvasWidth;

      const left = textX;
      const right = textX + textWidth;
      const top = textY - fontSize;
      const bottom = textY;

      const closestX = Math.max(left, Math.min(x, right));
      const closestY = Math.max(top, Math.min(y, bottom));
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

      if (distance <= radius) {
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      }
      continue;
    }

    // Handle checkboxes - erase entirely when touched
    if (stroke.type === "checkbox") {
      const checkboxX = stroke.x * canvasWidth;
      const checkboxY = stroke.y * canvasHeight;
      const checkboxSize = stroke.size * canvasWidth;

      const closestX = Math.max(checkboxX, Math.min(x, checkboxX + checkboxSize));
      const closestY = Math.max(checkboxY, Math.min(y, checkboxY + checkboxSize));
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

      if (distance <= radius) {
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      }
      continue;
    }

    // Handle date stamps - erase entirely when touched
    if (stroke.type === "datestamp") {
      const dateX = stroke.x * canvasWidth;
      const dateY = stroke.y * canvasHeight;
      const fontSize = stroke.fontSize * canvasHeight;

      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = `${fontSize}px Arial`;
      const dateText = formatDate(stroke.date, stroke.format || "MM/DD/YYYY");
      const textWidth = ctx.measureText(dateText).width;

      const left = dateX;
      const right = dateX + textWidth;
      const top = dateY - fontSize;
      const bottom = dateY;

      const closestX = Math.max(left, Math.min(x, right));
      const closestY = Math.max(top, Math.min(y, bottom));
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

      if (distance <= radius) {
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      }
      continue;
    }

    // Handle text fields - erase entirely when touched
    if (stroke.type === "textfield") {
      const fieldX = stroke.x * canvasWidth;
      const fieldY = stroke.y * canvasHeight;
      const fieldWidth = stroke.width * canvasWidth;
      const fieldHeight = stroke.height * canvasHeight;

      const closestX = Math.max(fieldX, Math.min(x, fieldX + fieldWidth));
      const closestY = Math.max(fieldY, Math.min(y, fieldY + fieldHeight));
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

      if (distance <= radius) {
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      }
      continue;
    }

    // Handle comments - erase entirely when touched
    if (stroke.type === "comment") {
      const commentX = stroke.x * canvasWidth;
      const commentY = stroke.y * canvasHeight;
      const iconSize = 30;

      const closestX = Math.max(commentX, Math.min(x, commentX + iconSize));
      const closestY = Math.max(commentY, Math.min(y, commentY + iconSize));
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

      if (distance <= radius) {
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      }
      continue;
    }

    // Handle watermarks - erase entirely when touched
    if (stroke.type === "watermark") {
      const watermarkX = stroke.x * canvasWidth;
      const watermarkY = stroke.y * canvasHeight;
      const fontSize = stroke.fontSize * canvasHeight;
      const tempCtx = document.createElement("canvas").getContext("2d");
      tempCtx.font = `bold ${fontSize}px Arial`;
      const textWidth = tempCtx.measureText(stroke.text).width;
      const halfWidth = textWidth / 2;
      const halfHeight = fontSize / 2;

      const closestX = Math.max(watermarkX - halfWidth, Math.min(x, watermarkX + halfWidth));
      const closestY = Math.max(watermarkY - halfHeight, Math.min(y, watermarkY + halfHeight));
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

      if (distance <= radius) {
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      }
      continue;
    }

    // Handle measurements - erase entirely when touched
    if (stroke.type === "measurement") {
      let shouldDelete = false;

      if (stroke.measureType === "distance") {
        const x1 = stroke.startX * canvasWidth;
        const y1 = stroke.startY * canvasHeight;
        const x2 = stroke.endX * canvasWidth;
        const y2 = stroke.endY * canvasHeight;
        const distance = pointToLineDistance(x, y, x1, y1, x2, y2);
        if (distance <= radius) shouldDelete = true;
      } else if (stroke.measureType === "area") {
        if (pointInPolygon(x, y, stroke.points, canvasWidth, canvasHeight)) {
          shouldDelete = true;
        }
      }

      if (shouldDelete) {
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      }
      continue;
    }

    // Handle signature-images - erase entirely when touched
    if (stroke.type === "signature-image") {
      const sigX = stroke.x * canvasWidth;
      const sigY = stroke.y * canvasHeight;
      const sigWidth = stroke.width * canvasWidth;
      const sigHeight = stroke.height * canvasHeight;

      const closestX = Math.max(sigX, Math.min(x, sigX + sigWidth));
      const closestY = Math.max(sigY, Math.min(y, sigY + sigHeight));
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

      if (distance <= radius) {
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      }
      continue;
    }

    // Handle stamps - erase entirely when touched
    if (stroke.type === "stamp") {
      const stampX = stroke.x * canvasWidth;
      const stampY = stroke.y * canvasHeight;
      const stampWidth = stroke.width * canvasWidth;
      const stampHeight = stroke.height * canvasHeight;

      // Stamps are centered
      const left = stampX - stampWidth / 2;
      const right = stampX + stampWidth / 2;
      const top = stampY - stampHeight / 2;
      const bottom = stampY + stampHeight / 2;

      // Check if eraser touches stamp
      const closestX = Math.max(left, Math.min(x, right));
      const closestY = Math.max(top, Math.min(y, bottom));
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

      if (distance <= radius) {
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      }
      continue;
    }

    // Handle redactions - erase entirely when touched
    if (stroke.type === "redaction") {
      const redactX = stroke.x * canvasWidth;
      const redactY = stroke.y * canvasHeight;
      const redactWidth = stroke.width * canvasWidth;
      const redactHeight = stroke.height * canvasHeight;

      const closestX = Math.max(redactX, Math.min(x, redactX + redactWidth));
      const closestY = Math.max(redactY, Math.min(y, redactY + redactHeight));
      const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

      if (distance <= radius) {
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      }
      continue;
    }

    // Handle shapes - convert to points and split like pen strokes
    if (stroke.type === "shape") {
      // Convert shape to points based on type
      const points = convertShapeToPoints(stroke, canvasWidth, canvasHeight);

      // Create a temporary stroke object with points
      const tempStroke = {
        type: stroke.type,
        color: stroke.color,
        width: stroke.width,
        shapeType: stroke.shapeType,
        points: points.map((p) => ({
          x: p.x / canvasWidth,
          y: p.y / canvasHeight,
        })),
      };

      // Split using the same logic as pen strokes
      const newSegments = splitStrokeByEraser(
        tempStroke,
        x,
        y,
        radius,
        canvasWidth,
        canvasHeight
      );

      if (newSegments.length === 0) {
        // Entire shape erased
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;
      } else if (
        newSegments.length === 1 &&
        newSegments[0].points.length === tempStroke.points.length
      ) {
        // No points erased, shape unchanged
        continue;
      } else {
        // Shape was split - convert segments back to shapes or pen strokes
        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;

        // Add new segments as pen strokes (since split shapes become irregular)
        newSegments.forEach((segment) => {
          const newStroke = {
            type: "pen",
            color: stroke.color,
            width: stroke.width,
            points: segment.points,
          };
          strokeHistory[pageIndex].splice(i, 0, newStroke);
        });
      }
      continue;
    }

    if (!stroke.points || stroke.points.length === 0) continue;

    // Split the stroke into segments, keeping only parts outside eraser radius
    const newSegments = splitStrokeByEraser(
      stroke,
      x,
      y,
      radius,
      canvasWidth,
      canvasHeight
    );

    if (newSegments.length === 0) {
      // Entire stroke erased
      const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
      undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
      redoStacks[pageIndex].length = 0;
    } else if (
      newSegments.length === 1 &&
      newSegments[0].points.length === stroke.points.length
    ) {
      // No points erased, stroke unchanged
      continue;
    } else {
      // Stroke was split into segments
      // Remove original stroke
      const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
      undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
      redoStacks[pageIndex].length = 0;

      // Add new segments
      newSegments.forEach((segment) => {
        strokeHistory[pageIndex].splice(i, 0, segment);
      });
    }
  }
}

// Convert shape to a series of points for eraser processing
function convertShapeToPoints(stroke, canvasWidth, canvasHeight) {
  const points = [];
  const x1 = stroke.startX * canvasWidth;
  const y1 = stroke.startY * canvasHeight;
  const x2 = stroke.endX * canvasWidth;
  const y2 = stroke.endY * canvasHeight;

  if (stroke.shapeType === "rectangle") {
    // Sample points around rectangle perimeter
    const steps = 50;
    const width = x2 - x1;
    const height = y2 - y1;

    // Top edge
    for (let i = 0; i <= steps; i++) {
      points.push({ x: x1 + (width * i) / steps, y: y1 });
    }
    // Right edge
    for (let i = 1; i <= steps; i++) {
      points.push({ x: x2, y: y1 + (height * i) / steps });
    }
    // Bottom edge
    for (let i = 1; i <= steps; i++) {
      points.push({ x: x2 - (width * i) / steps, y: y2 });
    }
    // Left edge
    for (let i = 1; i < steps; i++) {
      points.push({ x: x1, y: y2 - (height * i) / steps });
    }
  } else if (stroke.shapeType === "circle") {
    // Sample points around circle
    const steps = 100;
    const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      points.push({
        x: x1 + radius * Math.cos(angle),
        y: y1 + radius * Math.sin(angle),
      });
    }
  } else if (stroke.shapeType === "line" || stroke.shapeType === "arrow") {
    // Sample points along the line
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
      });
    }
  }

  return points;
}

function splitStrokeByEraser(
  stroke,
  eraserX,
  eraserY,
  radius,
  canvasWidth,
  canvasHeight
) {
  const segments = [];
  let currentSegment = null;

  for (let i = 0; i < stroke.points.length; i++) {
    const point = stroke.points[i];
    const px = point.x * canvasWidth;
    const py = point.y * canvasHeight;

    const distance = Math.sqrt((eraserX - px) ** 2 + (eraserY - py) ** 2);
    const isErased = distance <= radius;

    if (!isErased) {
      // Point survives - add to current segment
      if (!currentSegment) {
        currentSegment = {
          color: stroke.color,
          width: stroke.width,
          points: [],
        };
      }
      currentSegment.points.push(point);
    } else {
      // Point is erased - finish current segment if exists
      if (currentSegment && currentSegment.points.length > 0) {
        segments.push(currentSegment);
        currentSegment = null;
      }
    }
  }

  // Add final segment if exists
  if (currentSegment && currentSegment.points.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
}
