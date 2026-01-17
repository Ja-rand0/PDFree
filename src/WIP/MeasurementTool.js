// MeasurementTool.js - Distance and area measurement tools
// Future Feature - NOT YET IMPLEMENTED

/*
 * PLANNED FEATURES:
 *
 * 1. Distance Measurement
 *    - Click two points to measure distance
 *    - Shows measurement label on line
 *    - Configurable units (px, in, cm, mm)
 *
 * 2. Area Measurement
 *    - Click multiple points to create polygon
 *    - Shows area measurement
 *    - Configurable units
 *
 * 3. Perimeter Measurement
 *    - Measure perimeter of drawn polygon
 *
 * 4. Scale Calibration
 *    - Set real-world scale (e.g., "this line = 10 inches")
 *    - Apply to all subsequent measurements
 *
 * STROKE FORMATS:
 *
 * Distance:
 * {
 *   type: "measurement",
 *   measureType: "distance",
 *   startX, startY, endX, endY: normalized coordinates,
 *   value: number,
 *   unit: string
 * }
 *
 * Area:
 * {
 *   type: "measurement",
 *   measureType: "area",
 *   points: array of {x, y},
 *   value: number,
 *   unit: string
 * }
 */

const measurementUnits = {
  px: { name: "pixels", factor: 1 },
  in: { name: "inches", factor: 1 / 96 }, // Assuming 96 DPI
  cm: { name: "centimeters", factor: 2.54 / 96 },
  mm: { name: "millimeters", factor: 25.4 / 96 },
};

let currentMeasureUnit = "px";
let scaleCalibration = 1; // pixels per real unit

function setMeasurementUnit(unit) {
  if (measurementUnits[unit]) {
    currentMeasureUnit = unit;
  }
}

function calibrateScale(pixelDistance, realDistance, unit) {
  // Set scale: pixelDistance pixels = realDistance units
  scaleCalibration = pixelDistance / realDistance;
  currentMeasureUnit = unit;
  console.log(`Scale calibrated: ${pixelDistance}px = ${realDistance}${unit}`);
}

// ========== DISTANCE ==========

function calculateDistance(x1, y1, x2, y2, canvasWidth, canvasHeight) {
  const pixelDist = Math.sqrt(
    Math.pow((x2 - x1) * canvasWidth, 2) + Math.pow((y2 - y1) * canvasHeight, 2)
  );

  const realDist =
    (pixelDist / scaleCalibration) *
    measurementUnits[currentMeasureUnit].factor;
  return realDist;
}

function handleDistanceMeasureStart(e, canvas, pageIndex) {
  // TODO: Implement
  console.log("Distance measurement not yet implemented");
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

  ctx.font = "12px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(midX - 30, midY - 10, 60, 20);
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, midX, midY);
}

// ========== AREA ==========

function calculatePolygonArea(points, canvasWidth, canvasHeight) {
  // Shoelace formula
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
    Math.pow(measurementUnits[currentMeasureUnit].factor, 2);
  return realArea;
}

function handleAreaMeasureStart(e, canvas, pageIndex) {
  // TODO: Implement
  console.log("Area measurement not yet implemented");
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

  // Draw label at centroid
  let cx = 0,
    cy = 0;
  stroke.points.forEach((pt) => {
    cx += pt.x * canvasWidth;
    cy += pt.y * canvasHeight;
  });
  cx /= stroke.points.length;
  cy /= stroke.points.length;

  const label = `${stroke.value.toFixed(2)} ${stroke.unit}²`;
  ctx.font = "12px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(cx - 35, cy - 10, 70, 20);
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy);
}
