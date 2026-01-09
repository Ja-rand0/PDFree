// Move tool functionality - click and drag to move objects

function handleMoveStart(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);

  // Check if clicking on text
  const clickedText = checkTextClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedText) {
    return {
      moving: true,
      movingObject: clickedText,
      dragStartPos: p,
      originalProps: {
        x: clickedText.x,
        y: clickedText.y,
      },
    };
  }

  // Check if clicking on image
  const clickedImage = checkImageClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedImage) {
    return {
      moving: true,
      movingObject: clickedImage,
      dragStartPos: p,
      originalProps: {
        x: clickedImage.x,
        y: clickedImage.y,
      },
    };
  }

  // Check if clicking on pen stroke
  const clickedStroke = checkStrokeClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedStroke) {
    return {
      moving: true,
      movingObject: clickedStroke,
      dragStartPos: p,
      originalProps: {
        points: clickedStroke.points.map((pt) => ({ x: pt.x, y: pt.y })),
      },
    };
  }

  return { moving: false };
}

function handleMoveMove(e, canvas, pageIndex, state) {
  if (!state.moving || !state.movingObject) return state;

  const p = getCanvasPosition(e, canvas);
  const ctx = canvas.getContext("2d");

  const dx = (p.x - state.dragStartPos.x) / canvas.width;
  const dy = (p.y - state.dragStartPos.y) / canvas.height;

  if (state.movingObject.type === "text") {
    // Move text
    state.movingObject.x = state.originalProps.x + dx;
    state.movingObject.y = state.originalProps.y + dy;
  } else if (state.movingObject.type === "image") {
    // Move image
    state.movingObject.x = state.originalProps.x + dx;
    state.movingObject.y = state.originalProps.y + dy;
  } else if (state.movingObject.points) {
    // Move pen stroke - update all points
    state.movingObject.points = state.originalProps.points.map((pt) => ({
      x: pt.x + dx,
      y: pt.y + dy,
    }));
  }

  redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
  return state;
}

function handleMoveStop(state) {
  return {
    moving: false,
    movingObject: null,
    dragStartPos: null,
    originalProps: null,
  };
}

// Helper function to check if clicking on a stroke (reused from DeleteTool)
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

// Helper function to check if clicking on an image
function checkImageClick(pageIndex, x, y, canvasWidth, canvasHeight) {
  const strokes = strokeHistory[pageIndex];
  if (!strokes) return null;

  // Check in reverse order (most recent first)
  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.type === "image") {
      const imgX = stroke.x * canvasWidth;
      const imgY = stroke.y * canvasHeight;
      const imgWidth = stroke.width * canvasWidth;
      const imgHeight = stroke.height * canvasHeight;

      // Check if click is inside image bounds
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
