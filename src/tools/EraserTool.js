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
