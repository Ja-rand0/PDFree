// TextFieldTool.js - Click and drag to create fillable text field boxes

let defaultTextFieldHeight = 0.03; // Normalized height (3% of canvas height)

function handleTextFieldStart(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);
  return {
    drawing: true,
    startX: p.x / canvas.width,
    startY: p.y / canvas.height,
  };
}

function handleTextFieldMove(e, canvas, pageIndex, state) {
  if (!state.drawing || currentTool !== "textfield") return state;

  const p = getCanvasPosition(e, canvas);
  const ctx = canvas.getContext("2d");

  // Redraw everything
  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);

  // Draw preview rectangle
  const startX = state.startX * canvas.width;
  const startY = state.startY * canvas.height;
  const width = p.x - startX;
  const height = p.y - startY;

  ctx.strokeStyle = "#2196F3";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(startX, startY, width, height);
  ctx.setLineDash([]);

  return state;
}

function handleTextFieldStop(canvas, pageIndex, state) {
  if (!state.drawing) return { drawing: false };

  const ctx = canvas.getContext("2d");
  const currentPos = {
    x: state.startX * canvas.width,
    y: state.startY * canvas.height,
  };

  // Get final position from last mouse event
  const finalX = state.startX;
  const finalY = state.startY;

  // Calculate width and height in normalized coordinates
  const width = Math.abs(
    (currentPos.x - state.startX * canvas.width) / canvas.width
  );
  const height = Math.abs(
    (currentPos.y - state.startY * canvas.height) / canvas.height
  );

  // Only create if dragged (minimum size)
  if (width < 0.01 && height < 0.01) {
    // Click without drag - create default sized text field
    const textField = {
      type: "textfield",
      x: finalX,
      y: finalY,
      width: 0.2, // Default 20% of canvas width
      height: defaultTextFieldHeight,
      text: "",
      fontSize: 0.02,
      color: "#000000",
    };

    strokeHistory[pageIndex].push(textField);
    undoStacks[pageIndex].push(textField);
    redoStacks[pageIndex].length = 0;
  } else {
    // Dragged - use dragged dimensions
    const textField = {
      type: "textfield",
      x: Math.min(finalX, finalX + width / canvas.width),
      y: Math.min(finalY, finalY + height / canvas.height),
      width: width,
      height: height,
      text: "",
      fontSize: Math.min(height * 0.6, 0.02), // Font size is 60% of field height
      color: "#000000",
    };

    strokeHistory[pageIndex].push(textField);
    undoStacks[pageIndex].push(textField);
    redoStacks[pageIndex].length = 0;
  }

  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);

  return { drawing: false };
}

function handleTextFieldClick(textField, canvas, pageIndex) {
  // Show prompt to edit text
  const newText = prompt("Enter text for field:", textField.text);
  if (newText !== null) {
    textField.text = newText;
    redrawStrokes(
      canvas.getContext("2d"),
      pageIndex,
      canvas.width,
      canvas.height
    );
  }
}
