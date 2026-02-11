// Measurement tool functionality

let measurementMode = "distance"; // "distance" or "area"
let measurementPoints = []; // For area measurement
let measurementUnit = "px"; // "px", "in", "cm", "mm"
let scaleCalibration = 1; // pixels per unit

const measurementUnits = {
  px: { name: "pixels", factor: 1 },
  in: { name: "inches", factor: 1 / 96 },
  ft: { name: "feet", factor: 1 / 96 / 12 },
  cm: { name: "centimeters", factor: 2.54 / 96 },
  mm: { name: "millimeters", factor: 25.4 / 96 },
};

function setMeasurementMode(mode) {
  measurementMode = mode;
  measurementPoints = [];
}

function setMeasurementUnit(unit) {
  if (measurementUnits[unit]) {
    measurementUnit = unit;
  }
}

function calculateDistance(x1, y1, x2, y2, canvasWidth, canvasHeight) {
  const pixelDist = Math.sqrt(
    Math.pow((x2 - x1) * canvasWidth, 2) + Math.pow((y2 - y1) * canvasHeight, 2)
  );
  const realDist =
    (pixelDist / scaleCalibration) *
    measurementUnits[measurementUnit].factor;
  return realDist;
}

function calculatePolygonArea(points, canvasWidth, canvasHeight) {
  if (points.length < 3) return 0;

  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = points[i].x * canvasWidth;
    const yi = points[i].y * canvasHeight;
    const xj = points[j].x * canvasWidth;
    const yj = points[j].y * canvasHeight;
    area += xi * yj - xj * yi;
  }

  const pixelArea = Math.abs(area / 2);
  const realArea =
    (pixelArea / Math.pow(scaleCalibration, 2)) *
    Math.pow(measurementUnits[measurementUnit].factor, 2);
  return realArea;
}

// ========== DISTANCE MEASUREMENT ==========

function handleDistanceMeasureStart(e, canvas, pageIndex) {
  const normalizedP = getNormalizedPosition(e, canvas);

  return {
    measuringDistance: true,
    measureStartPoint: normalizedP,
  };
}

function handleDistanceMeasureMove(e, canvas, state) {
  if (!state.measuringDistance) return state;

  const ctx = canvas.getContext("2d");
  const p1 = {
    x: state.measureStartPoint.x * canvas.width,
    y: state.measureStartPoint.y * canvas.height
  };
  const p2 = getCanvasPosition(e, canvas);
  const normalizedP2 = getNormalizedPosition(e, canvas);

  // Find the page index for this canvas
  let pageIndex = -1;
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].inkC === canvas) {
      pageIndex = i;
      break;
    }
  }

  if (pageIndex !== -1) {
    // Redraw to clear previous preview
    redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
  }

  // Draw preview line
  ctx.strokeStyle = "#FF5722";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw endpoints
  ctx.fillStyle = "#FF5722";
  ctx.beginPath();
  ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2);
  ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Store current end point for use in stop handler
  return { ...state, currentEndPoint: normalizedP2 };
}

function handleDistanceMeasureStop(canvas, pageIndex, state) {
  if (!state.measuringDistance || !state.currentEndPoint) {
    return { measuringDistance: false, measureStartPoint: null, currentEndPoint: null };
  }

  const ctx = canvas.getContext("2d");
  const endPoint = state.currentEndPoint;

  const distance = calculateDistance(
    state.measureStartPoint.x,
    state.measureStartPoint.y,
    endPoint.x,
    endPoint.y,
    canvas.width,
    canvas.height
  );

  const measurementStroke = {
    type: "measurement",
    measureType: "distance",
    startX: state.measureStartPoint.x,
    startY: state.measureStartPoint.y,
    endX: endPoint.x,
    endY: endPoint.y,
    value: distance,
    unit: measurementUnit,
  };

  strokeHistory[pageIndex].push(measurementStroke);
  undoStacks[pageIndex].push(measurementStroke);
  redoStacks[pageIndex].length = 0;

  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);

  return { measuringDistance: false, measureStartPoint: null, currentEndPoint: null };
}

// ========== AREA MEASUREMENT ==========

function handleAreaMeasureClick(e, canvas, pageIndex) {
  const normalizedP = getNormalizedPosition(e, canvas);
  const p = getCanvasPosition(e, canvas);

  // Check if clicking near the first point to complete the polygon
  if (measurementPoints.length >= 3) {
    const firstPoint = measurementPoints[0];
    const firstX = firstPoint.x * canvas.width;
    const firstY = firstPoint.y * canvas.height;
    const distance = Math.sqrt((p.x - firstX) ** 2 + (p.y - firstY) ** 2);

    // If within 15 pixels of first point, complete the polygon
    if (distance <= 15) {
      handleAreaMeasureComplete(canvas, pageIndex);
      return;
    }
  }

  measurementPoints.push(normalizedP);

  const ctx = canvas.getContext("2d");
  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);

  // Draw current polygon preview
  if (measurementPoints.length > 0) {
    ctx.strokeStyle = "#FF5722";
    ctx.fillStyle = "rgba(255, 87, 34, 0.2)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    measurementPoints.forEach((pt, i) => {
      const x = pt.x * canvas.width;
      const y = pt.y * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = "#FF5722";
    measurementPoints.forEach((pt, i) => {
      const x = pt.x * canvas.width;
      const y = pt.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, i === 0 ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Highlight first point if we have at least 3 points
    if (measurementPoints.length >= 3) {
      const firstX = measurementPoints[0].x * canvas.width;
      const firstY = measurementPoints[0].y * canvas.height;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(firstX, firstY, 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function handleAreaMeasureComplete(canvas, pageIndex) {
  if (measurementPoints.length < 3) {
    measurementPoints = [];
    return;
  }

  const area = calculatePolygonArea(measurementPoints, canvas.width, canvas.height);

  const measurementStroke = {
    type: "measurement",
    measureType: "area",
    points: [...measurementPoints],
    value: area,
    unit: measurementUnit,
  };

  strokeHistory[pageIndex].push(measurementStroke);
  undoStacks[pageIndex].push(measurementStroke);
  redoStacks[pageIndex].length = 0;

  measurementPoints = [];

  const ctx = canvas.getContext("2d");
  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
}

// ========== RENDERING ==========

function renderMeasurement(ctx, stroke, canvasWidth, canvasHeight) {
  if (stroke.measureType === "distance") {
    renderDistanceMeasurement(ctx, stroke, canvasWidth, canvasHeight);
  } else if (stroke.measureType === "area") {
    renderAreaMeasurement(ctx, stroke, canvasWidth, canvasHeight);
  }
}

function renderDistanceMeasurement(ctx, stroke, canvasWidth, canvasHeight) {
  const x1 = stroke.startX * canvasWidth;
  const y1 = stroke.startY * canvasHeight;
  const x2 = stroke.endX * canvasWidth;
  const y2 = stroke.endY * canvasHeight;

  // Draw line
  ctx.strokeStyle = "#FF5722";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw endpoints
  ctx.fillStyle = "#FF5722";
  ctx.beginPath();
  ctx.arc(x1, y1, 5, 0, Math.PI * 2);
  ctx.arc(x2, y2, 5, 0, Math.PI * 2);
  ctx.fill();

  // Draw label
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const label = `${stroke.value.toFixed(2)} ${stroke.unit}`;

  ctx.font = "14px Arial";
  ctx.fillStyle = "#FFFFFF";
  const textWidth = ctx.measureText(label).width;
  ctx.fillRect(midX - textWidth / 2 - 4, midY - 10, textWidth + 8, 20);
  ctx.fillStyle = "#FF5722";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, midX, midY);
}

function renderAreaMeasurement(ctx, stroke, canvasWidth, canvasHeight) {
  if (!stroke.points || stroke.points.length < 3) return;

  // Draw polygon
  ctx.strokeStyle = "#FF5722";
  ctx.fillStyle = "rgba(255, 87, 34, 0.2)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  stroke.points.forEach((pt, i) => {
    const x = pt.x * canvasWidth;
    const y = pt.y * canvasHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw vertices
  ctx.fillStyle = "#FF5722";
  stroke.points.forEach((pt) => {
    const x = pt.x * canvasWidth;
    const y = pt.y * canvasHeight;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw label at centroid
  let cx = 0, cy = 0;
  stroke.points.forEach((pt) => {
    cx += pt.x * canvasWidth;
    cy += pt.y * canvasHeight;
  });
  cx /= stroke.points.length;
  cy /= stroke.points.length;

  const label = `${stroke.value.toFixed(2)} ${stroke.unit}²`;
  ctx.font = "14px Arial";
  ctx.fillStyle = "#FFFFFF";
  const textWidth = ctx.measureText(label).width;
  ctx.fillRect(cx - textWidth / 2 - 4, cy - 10, textWidth + 8, 20);
  ctx.fillStyle = "#FF5722";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy);
}
