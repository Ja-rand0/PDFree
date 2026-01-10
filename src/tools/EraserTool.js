// Eraser tool functionality - traditional brush that erases as you drag

function handleEraserStart(e, canvas, pageIndex) {
  console.log("Eraser start called");
  const p = getCanvasPosition(e, canvas);
  console.log("Eraser position:", p);

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

  console.log("Eraser moving");
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

  console.log("Eraser stopped");
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
  console.log("eraseAtPoint called at", x, y, "with radius", radius);
  const strokes = strokeHistory[pageIndex];
  if (!strokes) {
    console.log("No strokes found for page", pageIndex);
    return;
  }

  console.log("Checking", strokes.length, "strokes");

  // Process each stroke
  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];

    // Skip text objects (use delete tool for those)
    if (stroke.type === "text") continue;

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
        console.log("Entire shape erased");
      } else if (
        newSegments.length === 1 &&
        newSegments[0].points.length === tempStroke.points.length
      ) {
        // No points erased, shape unchanged
        continue;
      } else {
        // Shape was split - convert segments back to shapes or pen strokes
        console.log("Shape split into", newSegments.length, "segments");
        console.log("Original shape type:", stroke.shapeType);
        console.log("Segments:", newSegments);

        const deletedStroke = strokeHistory[pageIndex].splice(i, 1)[0];
        undoStacks[pageIndex].push({ type: "erase", stroke: deletedStroke });
        redoStacks[pageIndex].length = 0;

        // Add new segments as pen strokes (since split shapes become irregular)
        newSegments.forEach((segment, idx) => {
          const newStroke = {
            type: "pen",
            color: stroke.color,
            width: stroke.width,
            points: segment.points,
          };
          console.log(
            `Adding segment ${idx} with ${segment.points.length} points`
          );
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
      console.log("Entire stroke erased");
    } else if (
      newSegments.length === 1 &&
      newSegments[0].points.length === stroke.points.length
    ) {
      // No points erased, stroke unchanged
      continue;
    } else {
      // Stroke was split into segments
      console.log("Stroke split into", newSegments.length, "segments");

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
