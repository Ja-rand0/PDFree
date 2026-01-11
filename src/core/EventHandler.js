// Canvas event listeners and tool routing

function getCanvasPosition(e, canvas) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function getNormalizedPosition(e, canvas) {
  const p = getCanvasPosition(e, canvas);
  return {
    x: p.x / canvas.width,
    y: p.y / canvas.height,
  };
}

function attachCanvasListeners(canvas, pageIndex) {
  let toolState = {
    drawing: false,
    currentStroke: null,
    resizing: false,
    resizeHandle: null,
    dragStartPos: null,
    originalTextProps: null,
    erasing: false,
    eraserRadius: 20,
    moving: false,
    movingObject: null,
    originalProps: null,
    highlighting: false,
    drawingShape: false,
    shapeType: null,
    startPos: null,
    drawingSignature: false,
  };

  function start(e) {
    const p = getCanvasPosition(e, canvas);

    if (currentTool === "text") {
      handleTextClick(e, canvas, pageIndex);
      return;
    }

    if (currentTool === "select") {
      const selectState = handleSelectStart(e, canvas, pageIndex);
      toolState = { ...toolState, ...selectState };
      return;
    }

    if (currentTool === "move") {
      const moveState = handleMoveStart(e, canvas, pageIndex);
      toolState = { ...toolState, ...moveState };
      return;
    }

    if (currentTool === "delete") {
      handleDeleteClick(e, canvas, pageIndex);
      return;
    }

    if (currentTool === "eraser") {
      const eraserState = handleEraserStart(e, canvas, pageIndex);
      toolState = { ...toolState, ...eraserState };
      return;
    }

    if (currentTool === "highlight") {
      const highlightState = handleHighlightStart(e, canvas, pageIndex);
      toolState = { ...toolState, ...highlightState };
      return;
    }

    if (currentTool === "image") {
      handleImageClick(e, canvas, pageIndex);
      return;
    }

    if (currentTool === "shape") {
      const shapeState = handleShapeStart(e, canvas, pageIndex);
      toolState = { ...toolState, ...shapeState };
      return;
    }

    if (currentTool === "signature") {
      handleSignatureClick(e, canvas, pageIndex);
      return;
    }

    if (currentTool === "stamp") {
      handleStampClick(e, canvas, pageIndex);
      return;
    }

    if (currentTool === "pen") {
      const penState = handlePenStart(e, canvas, pageIndex);
      toolState = { ...toolState, ...penState };
    }
  }

  function move(e) {
    if (
      currentTool === "select" &&
      (toolState.resizing ||
        toolState.resizingMultiple ||
        toolState.mode === "dragBox" ||
        toolState.mode === "movingMultiple")
    ) {
      toolState = handleSelectMove(e, canvas, pageIndex, toolState);
      return;
    }

    if (currentTool === "move" && toolState.moving) {
      toolState = handleMoveMove(e, canvas, pageIndex, toolState);
      return;
    }

    if (currentTool === "eraser" && toolState.erasing) {
      toolState = handleEraserMove(e, canvas, pageIndex, toolState);
      return;
    }

    if (currentTool === "highlight" && toolState.highlighting) {
      toolState = handleHighlightMove(e, canvas, toolState);
      return;
    }

    if (currentTool === "shape" && toolState.drawingShape) {
      toolState = handleShapeMove(e, canvas, pageIndex, toolState);
      return;
    }

    if (currentTool === "pen" && toolState.drawing) {
      toolState = handlePenMove(e, canvas, toolState);
    }
  }

  function stop() {
    if (
      toolState.resizing ||
      toolState.resizingMultiple ||
      toolState.mode === "dragBox" ||
      toolState.mode === "movingMultiple"
    ) {
      toolState = handleSelectStop(canvas, pageIndex, toolState);
      return;
    }

    if (toolState.moving) {
      toolState = handleMoveStop(toolState);
      return;
    }

    if (toolState.erasing) {
      toolState = handleEraserStop(canvas, pageIndex, toolState);
      return;
    }

    if (toolState.highlighting) {
      toolState = handleHighlightStop(canvas, pageIndex, toolState);
      return;
    }

    if (toolState.drawingShape) {
      toolState = handleShapeStop(canvas, pageIndex, toolState);
      return;
    }

    if (toolState.drawing) {
      toolState = handlePenStop(canvas, pageIndex, toolState);
    }
  }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", stop);

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    start(e.touches[0]);
  });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    move(e.touches[0]);
  });
  window.addEventListener("touchend", (e) => {
    e.preventDefault();
    stop();
  });
}
