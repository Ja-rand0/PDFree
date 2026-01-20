// CheckboxTool.js - Click to place checkboxes, click again to toggle

let defaultCheckboxSize = 0.02; // Normalized size (2% of canvas width)

function handleCheckboxClick(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);
  const normalizedX = p.x / canvas.width;
  const normalizedY = p.y / canvas.height;

  // Check if clicking on an existing checkbox to toggle it
  const strokes = strokeHistory[pageIndex];
  if (strokes) {
    for (let i = strokes.length - 1; i >= 0; i--) {
      const stroke = strokes[i];
      if (stroke.type === "checkbox") {
        const checkboxX = stroke.x * canvas.width;
        const checkboxY = stroke.y * canvas.height;
        const checkboxSize = stroke.size * canvas.width;

        // Check if click is inside this checkbox
        if (
          p.x >= checkboxX &&
          p.x <= checkboxX + checkboxSize &&
          p.y >= checkboxY &&
          p.y <= checkboxY + checkboxSize
        ) {
          // Toggle the checkbox
          stroke.checked = !stroke.checked;
          redrawStrokes(
            canvas.getContext("2d"),
            pageIndex,
            canvas.width,
            canvas.height
          );
          return;
        }
      }
    }
  }

  // No existing checkbox clicked - create a new one
  const checkbox = {
    type: "checkbox",
    x: normalizedX,
    y: normalizedY,
    size: defaultCheckboxSize,
    checked: false,
  };

  strokeHistory[pageIndex].push(checkbox);
  undoStacks[pageIndex].push(checkbox);
  redoStacks[pageIndex].length = 0;

  // Redraw to show the new checkbox
  redrawStrokes(
    canvas.getContext("2d"),
    pageIndex,
    canvas.width,
    canvas.height
  );
}

function setCheckboxSize(size) {
  defaultCheckboxSize = size;
}
