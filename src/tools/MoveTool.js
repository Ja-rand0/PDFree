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

  // Check if clicking on shape
  const clickedShape = checkShapeClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedShape) {
    return {
      moving: true,
      movingObject: clickedShape,
      dragStartPos: p,
      originalProps: {
        startX: clickedShape.startX,
        startY: clickedShape.startY,
        endX: clickedShape.endX,
        endY: clickedShape.endY,
      },
    };
  }

  // Check if clicking on stamp
  const clickedStamp = checkStampClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedStamp) {
    return {
      moving: true,
      movingObject: clickedStamp,
      dragStartPos: p,
      originalProps: {
        x: clickedStamp.x,
        y: clickedStamp.y,
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
  } else if (state.movingObject.type === "shape") {
    // Move shape - update start and end positions
    state.movingObject.startX = state.originalProps.startX + dx;
    state.movingObject.startY = state.originalProps.startY + dy;
    state.movingObject.endX = state.originalProps.endX + dx;
    state.movingObject.endY = state.originalProps.endY + dy;
  } else if (state.movingObject.type === "stamp") {
    // Move stamp
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
