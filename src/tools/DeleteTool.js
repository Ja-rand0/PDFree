// Delete tool functionality - click any object to delete it entirely

function handleDeleteClick(e, canvas, pageIndex) {
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
    // Remove text from history
    const idx = strokeHistory[pageIndex].indexOf(clickedText);
    if (idx > -1) {
      const deletedStroke = strokeHistory[pageIndex].splice(idx, 1)[0];
      undoStacks[pageIndex].push({ type: "delete", stroke: deletedStroke });
      redoStacks[pageIndex].length = 0;

      // Deselect if it was selected
      if (selectedText === clickedText) {
        selectedText = null;
        selectedPageIndex = null;
      }

      redrawStrokes(
        canvas.getContext("2d"),
        pageIndex,
        canvas.width,
        canvas.height
      );
      console.log("Deleted text object");
    }
    return;
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
    // Remove image from history
    const idx = strokeHistory[pageIndex].indexOf(clickedImage);
    if (idx > -1) {
      const deletedStroke = strokeHistory[pageIndex].splice(idx, 1)[0];
      undoStacks[pageIndex].push({ type: "delete", stroke: deletedStroke });
      redoStacks[pageIndex].length = 0;

      // Deselect if it was selected
      if (selectedImage === clickedImage) {
        selectedImage = null;
        selectedPageIndex = null;
      }

      redrawStrokes(
        canvas.getContext("2d"),
        pageIndex,
        canvas.width,
        canvas.height
      );
      console.log("Deleted image object");
    }
    return;
  }

  // Check if clicking on signature
  const clickedSignature = checkSignatureClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedSignature) {
    const idx = strokeHistory[pageIndex].indexOf(clickedSignature);
    if (idx > -1) {
      const deletedStroke = strokeHistory[pageIndex].splice(idx, 1)[0];
      undoStacks[pageIndex].push({ type: "delete", stroke: deletedStroke });
      redoStacks[pageIndex].length = 0;

      if (selectedSignature === clickedSignature) {
        selectedSignature = null;
        selectedPageIndex = null;
      }

      redrawStrokes(
        canvas.getContext("2d"),
        pageIndex,
        canvas.width,
        canvas.height
      );
      console.log("Deleted signature");
    }
    return;
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
    // Remove stroke from history
    const idx = strokeHistory[pageIndex].indexOf(clickedStroke);
    if (idx > -1) {
      const deletedStroke = strokeHistory[pageIndex].splice(idx, 1)[0];
      undoStacks[pageIndex].push({ type: "delete", stroke: deletedStroke });
      redoStacks[pageIndex].length = 0;

      redrawStrokes(
        canvas.getContext("2d"),
        pageIndex,
        canvas.width,
        canvas.height
      );
      console.log("Deleted pen stroke");
    }
    return;
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
    const idx = strokeHistory[pageIndex].indexOf(clickedShape);
    if (idx > -1) {
      const deletedStroke = strokeHistory[pageIndex].splice(idx, 1)[0];
      undoStacks[pageIndex].push({ type: "delete", stroke: deletedStroke });
      redoStacks[pageIndex].length = 0;

      if (selectedShape === clickedShape) {
        selectedShape = null;
        selectedPageIndex = null;
      }

      redrawStrokes(
        canvas.getContext("2d"),
        pageIndex,
        canvas.width,
        canvas.height
      );
      console.log("Deleted shape");
    }
    return;
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
    const idx = strokeHistory[pageIndex].indexOf(clickedStamp);
    if (idx > -1) {
      const deletedStroke = strokeHistory[pageIndex].splice(idx, 1)[0];
      undoStacks[pageIndex].push({ type: "delete", stroke: deletedStroke });
      redoStacks[pageIndex].length = 0;

      if (selectedStamp === clickedStamp) {
        selectedStamp = null;
        selectedPageIndex = null;
      }

      redrawStrokes(
        canvas.getContext("2d"),
        pageIndex,
        canvas.width,
        canvas.height
      );
      console.log("Deleted stamp");
    }
    return;
  }
}
