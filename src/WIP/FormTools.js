// FormTools.js - Form filling tools (checkboxes, text fields, date stamps)
// Phase 2 Feature - NOT YET IMPLEMENTED

/*
 * PLANNED FEATURES:
 *
 * 1. Checkbox Tool
 *    - Click to place a checkbox
 *    - Click checkbox to toggle checked/unchecked
 *    - Customizable size
 *
 * 2. Text Field Tool
 *    - Click and drag to create a text input area
 *    - Bordered rectangle with editable text inside
 *    - Different from TextTool - this has a visible border/box
 *
 * 3. Date Stamp Tool
 *    - Click to insert current date
 *    - Configurable format (MM/DD/YYYY, etc.)
 *
 * STROKE FORMATS:
 *
 * Checkbox:
 * {
 *   type: "checkbox",
 *   x: normalized x position,
 *   y: normalized y position,
 *   size: normalized size,
 *   checked: boolean
 * }
 *
 * Text Field:
 * {
 *   type: "textfield",
 *   x: normalized x position,
 *   y: normalized y position,
 *   width: normalized width,
 *   height: normalized height,
 *   text: string,
 *   borderColor: color string
 * }
 *
 * Date Stamp:
 * {
 *   type: "datestamp",
 *   x: normalized x position,
 *   y: normalized y position,
 *   date: ISO date string,
 *   format: format string,
 *   color: color string,
 *   fontSize: normalized font size
 * }
 */

let currentFormTool = "checkbox"; // "checkbox", "textfield", "datestamp"
let dateFormat = "MM/DD/YYYY";

function setFormTool(tool) {
  if (["checkbox", "textfield", "datestamp"].includes(tool)) {
    currentFormTool = tool;
    console.log("Form tool set to:", tool);
  }
}

function setDateFormat(format) {
  dateFormat = format;
}

// ========== CHECKBOX ==========

function handleCheckboxClick(e, canvas, pageIndex) {
  // TODO: Implement
  console.log("Checkbox tool not yet implemented");
}

function renderCheckbox(ctx, stroke, canvasWidth, canvasHeight) {
  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const size = stroke.size * canvasWidth;

  // Draw box
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, size, size);

  // Draw check if checked
  if (stroke.checked) {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.2, y + size * 0.5);
    ctx.lineTo(x + size * 0.4, y + size * 0.75);
    ctx.lineTo(x + size * 0.8, y + size * 0.25);
    ctx.stroke();
  }
}

// ========== TEXT FIELD ==========

function handleTextFieldStart(e, canvas, pageIndex) {
  // TODO: Implement
  console.log("Text field tool not yet implemented");
}

function renderTextField(ctx, stroke, canvasWidth, canvasHeight) {
  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const width = stroke.width * canvasWidth;
  const height = stroke.height * canvasHeight;

  // Draw border
  ctx.strokeStyle = stroke.borderColor || "#000000";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  // Draw text
  if (stroke.text) {
    ctx.font = "14px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(stroke.text, x + 4, y + height / 2 + 5);
  }
}

// ========== DATE STAMP ==========

function handleDateStampClick(e, canvas, pageIndex) {
  // TODO: Implement
  console.log("Date stamp tool not yet implemented");
}

function formatDate(date, format) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();

  return format
    .replace("MM", month)
    .replace("DD", day)
    .replace("YYYY", year)
    .replace("YY", String(year).slice(-2));
}

function renderDateStamp(ctx, stroke, canvasWidth, canvasHeight) {
  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const fontSize = stroke.fontSize * canvasHeight;

  const dateText = formatDate(stroke.date, stroke.format || "MM/DD/YYYY");

  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = stroke.color || "#000000";
  ctx.fillText(dateText, x, y);
}
