// Text tool functionality

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

function handleTextClick(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);
  const clickedText = checkTextClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedText) {
    const textX = clickedText.x * canvas.width;
    const textY = clickedText.y * canvas.height;
    addTextBox(canvas, pageIndex, textX, textY, clickedText);
  } else {
    addTextBox(canvas, pageIndex, p.x, p.y);
  }
}

function addTextBox(canvas, pageIndex, x, y, existingStroke = null) {
  const rect = canvas.getBoundingClientRect();
  const input = document.createElement("input");
  input.type = "text";

  // Calculate proper positioning
  let inputLeft, inputTop, fontSize;

  if (existingStroke) {
    // Editing existing text - use its actual position and font size
    input.value = existingStroke.text;
    fontSize = existingStroke.fontSize * canvas.height;

    // Position input where the text actually is
    // Subtract the padding offsets we added when creating
    inputLeft = rect.left + x - 8; // Remove the 8px padding offset
    inputTop = rect.top + y - fontSize - 4; // Position at top of text
  } else {
    // Creating new text
    fontSize = 16;
    const boxOffsetX = -100;
    const boxOffsetY = -12;
    inputLeft = rect.left + x + boxOffsetX;
    inputTop = rect.top + y + boxOffsetY;
  }

  input.style.position = "fixed";
  input.style.left = `${inputLeft}px`;
  input.style.top = `${inputTop}px`;
  input.style.fontSize = `${fontSize}px`;
  input.style.border = "2px solid #3b82f6";
  input.style.padding = "4px 8px";
  input.style.borderRadius = "4px";
  input.style.zIndex = "10000";
  input.style.minWidth = "100px";
  input.style.backgroundColor = "white";
  input.style.pointerEvents = "auto";
  input.style.display = "block";

  document.body.appendChild(input);

  setTimeout(() => {
    input.focus();
    input.select();
  }, 10);

  function finishText() {
    const text = input.value.trim();

    if (existingStroke) {
      const idx = strokeHistory[pageIndex].indexOf(existingStroke);
      if (idx > -1) {
        strokeHistory[pageIndex].splice(idx, 1);
      }
    }

    if (text) {
      let normalizedX, normalizedY, normalizedFontSize;

      if (existingStroke) {
        // Keep existing position and font size
        normalizedX = existingStroke.x;
        normalizedY = existingStroke.y;
        normalizedFontSize = existingStroke.fontSize;
      } else {
        // New text - calculate position with offsets
        const boxOffsetX = -100;
        const boxOffsetY = -12;
        const textX = x + boxOffsetX + 8;
        const textY = y + boxOffsetY + 20;
        normalizedX = textX / canvas.width;
        normalizedY = textY / canvas.height;
        normalizedFontSize = 16 / canvas.height;
      }

      const ctx = canvas.getContext("2d");
      const actualFontSize = normalizedFontSize * canvas.height;
      ctx.font = `${actualFontSize}px Arial`;
      const textWidth = ctx.measureText(text).width;
      const normalizedWidth = textWidth / canvas.width;

      const textStroke = {
        type: "text",
        text: text,
        x: normalizedX,
        y: normalizedY,
        color: existingStroke ? existingStroke.color : strokeColor,
        fontSize: normalizedFontSize,
        width: normalizedWidth,
      };

      strokeHistory[pageIndex].push(textStroke);
      undoStacks[pageIndex].push(textStroke);
      redoStacks[pageIndex].length = 0;

      redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
    }
    input.remove();
  }

  input.addEventListener("blur", finishText);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      finishText();
    } else if (e.key === "Escape") {
      e.preventDefault();
      input.remove();
    }
  });
}
