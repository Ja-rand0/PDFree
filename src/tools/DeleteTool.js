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
    }
    return;
  }

  // Check if clicking on checkbox
  const clickedCheckbox = checkCheckboxClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedCheckbox) {
    const idx = strokeHistory[pageIndex].indexOf(clickedCheckbox);
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
    }
    return;
  }

  // Check if clicking on date stamp
  const clickedDateStamp = checkDateStampClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedDateStamp) {
    const idx = strokeHistory[pageIndex].indexOf(clickedDateStamp);
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
    }
    return;
  }

  const clickedTextField = checkTextFieldClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedTextField) {
    const idx = strokeHistory[pageIndex].indexOf(clickedTextField);
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
    }
    return;
  }

  // Check if clicking on comment
  const clickedComment = checkCommentClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedComment) {
    const idx = strokeHistory[pageIndex].indexOf(clickedComment);
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
    }
    return;
  }

  const clickedWatermark = checkWatermarkClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedWatermark) {
    const idx = strokeHistory[pageIndex].indexOf(clickedWatermark);
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
    }
    return;
  }

  // Check if clicking on redaction
  const clickedRedaction = checkRedactionClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedRedaction) {
    const idx = strokeHistory[pageIndex].indexOf(clickedRedaction);
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
    }
    return;
  }

  // Check if clicking on measurement
  const clickedMeasurement = checkMeasurementClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  if (clickedMeasurement) {
    const idx = strokeHistory[pageIndex].indexOf(clickedMeasurement);
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
    }
    return;
  }
}
