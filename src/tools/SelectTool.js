// Select tool functionality - select and resize text and images

function getHandleAtPosition(x, y, textStroke, canvas) {
  if (!textStroke) return null;

  const textX = textStroke.x * canvas.width;
  const textY = textStroke.y * canvas.height;
  const fontSize = textStroke.fontSize * canvas.height;
  const textWidth = textStroke.width * canvas.width;

  const boxX = textX - 2;
  const boxY = textY - fontSize;
  const boxW = textWidth + 4;
  const boxH = fontSize + 7;
  const hitArea = 80;

  if (Math.abs(x - boxX) < hitArea && Math.abs(y - boxY) < hitArea) return "tl";
  if (Math.abs(x - (boxX + boxW)) < hitArea && Math.abs(y - boxY) < hitArea)
    return "tr";
  if (Math.abs(x - boxX) < hitArea && Math.abs(y - (boxY + boxH)) < hitArea)
    return "bl";
  if (
    Math.abs(x - (boxX + boxW)) < hitArea &&
    Math.abs(y - (boxY + boxH)) < hitArea
  )
    return "br";
  if (Math.abs(x - (boxX + boxW / 2)) < hitArea && Math.abs(y - boxY) < hitArea)
    return "t";
  if (
    Math.abs(x - (boxX + boxW / 2)) < hitArea &&
    Math.abs(y - (boxY + boxH)) < hitArea
  )
    return "b";
  if (Math.abs(x - boxX) < hitArea && Math.abs(y - (boxY + boxH / 2)) < hitArea)
    return "l";
  if (
    Math.abs(x - (boxX + boxW)) < hitArea &&
    Math.abs(y - (boxY + boxH / 2)) < hitArea
  )
    return "r";

  return null;
}

function getImageHandleAtPosition(x, y, imageStroke, canvas) {
  if (!imageStroke) return null;

  const imgX = imageStroke.x * canvas.width;
  const imgY = imageStroke.y * canvas.height;
  const imgWidth = imageStroke.width * canvas.width;
  const imgHeight = imageStroke.height * canvas.height;

  const hitArea = 80;

  // Corner handles
  if (Math.abs(x - imgX) < hitArea && Math.abs(y - imgY) < hitArea) return "tl";
  if (Math.abs(x - (imgX + imgWidth)) < hitArea && Math.abs(y - imgY) < hitArea)
    return "tr";
  if (
    Math.abs(x - imgX) < hitArea &&
    Math.abs(y - (imgY + imgHeight)) < hitArea
  )
    return "bl";
  if (
    Math.abs(x - (imgX + imgWidth)) < hitArea &&
    Math.abs(y - (imgY + imgHeight)) < hitArea
  )
    return "br";

  // Edge handles
  if (
    Math.abs(x - (imgX + imgWidth / 2)) < hitArea &&
    Math.abs(y - imgY) < hitArea
  )
    return "t";
  if (
    Math.abs(x - (imgX + imgWidth / 2)) < hitArea &&
    Math.abs(y - (imgY + imgHeight)) < hitArea
  )
    return "b";
  if (
    Math.abs(x - imgX) < hitArea &&
    Math.abs(y - (imgY + imgHeight / 2)) < hitArea
  )
    return "l";
  if (
    Math.abs(x - (imgX + imgWidth)) < hitArea &&
    Math.abs(y - (imgY + imgHeight / 2)) < hitArea
  )
    return "r";

  return null;
}

function getShapeHandleAtPosition(x, y, shapeStroke, canvas) {
  if (!shapeStroke) return null;

  const startX = shapeStroke.startX * canvas.width;
  const startY = shapeStroke.startY * canvas.height;
  const endX = shapeStroke.endX * canvas.width;
  const endY = shapeStroke.endY * canvas.height;

  let left, top, width, height;

  if (shapeStroke.shapeType === "circle") {
    const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    left = startX - radius;
    top = startY - radius;
    width = radius * 2;
    height = radius * 2;
  } else {
    left = Math.min(startX, endX);
    top = Math.min(startY, endY);
    width = Math.abs(endX - startX);
    height = Math.abs(endY - startY);
  }

  const hitArea = 80;

  // Corner handles
  if (Math.abs(x - (left - 5)) < hitArea && Math.abs(y - (top - 5)) < hitArea)
    return "tl";
  if (
    Math.abs(x - (left + width + 5)) < hitArea &&
    Math.abs(y - (top - 5)) < hitArea
  )
    return "tr";
  if (
    Math.abs(x - (left - 5)) < hitArea &&
    Math.abs(y - (top + height + 5)) < hitArea
  )
    return "bl";
  if (
    Math.abs(x - (left + width + 5)) < hitArea &&
    Math.abs(y - (top + height + 5)) < hitArea
  )
    return "br";

  // Edge handles
  if (
    Math.abs(x - (left + width / 2)) < hitArea &&
    Math.abs(y - (top - 5)) < hitArea
  )
    return "t";
  if (
    Math.abs(x - (left + width / 2)) < hitArea &&
    Math.abs(y - (top + height + 5)) < hitArea
  )
    return "b";
  if (
    Math.abs(x - (left - 5)) < hitArea &&
    Math.abs(y - (top + height / 2)) < hitArea
  )
    return "l";
  if (
    Math.abs(x - (left + width + 5)) < hitArea &&
    Math.abs(y - (top + height / 2)) < hitArea
  )
    return "r";

  return null;
}

function getPenStrokeHandleAtPosition(x, y, stroke, canvas) {
  if (!stroke || !stroke.points || stroke.points.length === 0) return null;

  // Calculate bounding box
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  stroke.points.forEach((point) => {
    const px = point.x * canvas.width;
    const py = point.y * canvas.height;
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const hitArea = 80;

  // Corner handles
  if (Math.abs(x - (minX - 5)) < hitArea && Math.abs(y - (minY - 5)) < hitArea)
    return "tl";
  if (Math.abs(x - (maxX + 5)) < hitArea && Math.abs(y - (minY - 5)) < hitArea)
    return "tr";
  if (Math.abs(x - (minX - 5)) < hitArea && Math.abs(y - (maxY + 5)) < hitArea)
    return "bl";
  if (Math.abs(x - (maxX + 5)) < hitArea && Math.abs(y - (maxY + 5)) < hitArea)
    return "br";

  // Edge handles
  if (
    Math.abs(x - (minX + width / 2)) < hitArea &&
    Math.abs(y - (minY - 5)) < hitArea
  )
    return "t";
  if (
    Math.abs(x - (minX + width / 2)) < hitArea &&
    Math.abs(y - (maxY + 5)) < hitArea
  )
    return "b";
  if (
    Math.abs(x - (minX - 5)) < hitArea &&
    Math.abs(y - (minY + height / 2)) < hitArea
  )
    return "l";
  if (
    Math.abs(x - (maxX + 5)) < hitArea &&
    Math.abs(y - (minY + height / 2)) < hitArea
  )
    return "r";

  return null;
}

function handleSelectStart(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);
  const clickedText = checkTextClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  const clickedImage = checkImageClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  const clickedShape = checkShapeClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  const clickedStamp = checkStampClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  const clickedSignature = checkSignatureClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  const clickedPenStroke = checkPenStrokeClick(
    pageIndex,
    p.x,
    p.y,
    canvas.width,
    canvas.height
  );

  // Handle text selection and resizing
  if (selectedText === clickedText && clickedText) {
    const handle = getHandleAtPosition(p.x, p.y, selectedText, canvas);

    if (handle) {
      return {
        resizing: true,
        resizeHandle: handle,
        dragStartPos: p,
        originalTextProps: {
          x: selectedText.x,
          y: selectedText.y,
          fontSize: selectedText.fontSize,
          width: selectedText.width,
        },
      };
    }
  }

  // Handle image selection and resizing
  if (selectedImage === clickedImage && clickedImage) {
    const handle = getImageHandleAtPosition(p.x, p.y, selectedImage, canvas);

    if (handle) {
      return {
        resizing: true,
        resizeHandle: handle,
        dragStartPos: p,
        originalImageProps: {
          x: selectedImage.x,
          y: selectedImage.y,
          width: selectedImage.width,
          height: selectedImage.height,
        },
      };
    }
  }

  // Handle shape selection and resizing
  if (selectedShape === clickedShape && clickedShape) {
    const handle = getShapeHandleAtPosition(p.x, p.y, selectedShape, canvas);

    if (handle) {
      return {
        resizing: true,
        resizeHandle: handle,
        dragStartPos: p,
        originalShapeProps: {
          startX: selectedShape.startX,
          startY: selectedShape.startY,
          endX: selectedShape.endX,
          endY: selectedShape.endY,
        },
      };
    }
  }

  // Handle pen stroke selection and resizing
  if (selectedStroke === clickedPenStroke && clickedPenStroke) {
    const handle = getPenStrokeHandleAtPosition(
      p.x,
      p.y,
      selectedStroke,
      canvas
    );

    if (handle) {
      // Calculate bounding box
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      selectedStroke.points.forEach((point) => {
        const px = point.x * canvas.width;
        const py = point.y * canvas.height;
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      });

      return {
        resizing: true,
        resizeHandle: handle,
        dragStartPos: p,
        originalStrokeProps: {
          points: selectedStroke.points.map((pt) => ({ x: pt.x, y: pt.y })),
          minX: minX / canvas.width,
          minY: minY / canvas.height,
          maxX: maxX / canvas.width,
          maxY: maxY / canvas.height,
        },
      };
    }
  }

  // Select or deselect
  selectedText = clickedText;
  selectedImage = clickedImage;
  selectedShape = clickedShape;
  selectedStamp = clickedStamp;
  selectedSignature = clickedSignature;
  selectedStroke = clickedPenStroke;
  selectedPageIndex =
    clickedText ||
    clickedImage ||
    clickedShape ||
    clickedStamp ||
    clickedSignature ||
    clickedPenStroke
      ? pageIndex
      : null;
  redrawStrokes(
    canvas.getContext("2d"),
    pageIndex,
    canvas.width,
    canvas.height
  );
  return {};
}

function handleSelectMove(e, canvas, pageIndex, state) {
  const p = getCanvasPosition(e, canvas);
  const ctx = canvas.getContext("2d");

  if (state.resizing && selectedText) {
    const dx = (p.x - state.dragStartPos.x) / canvas.width;
    const dy = (p.y - state.dragStartPos.y) / canvas.height;

    let newFontSize = state.originalTextProps.fontSize;

    if (state.resizeHandle.includes("t")) {
      newFontSize = state.originalTextProps.fontSize - dy;
      selectedText.y = state.originalTextProps.y + dy;
    } else if (state.resizeHandle.includes("b")) {
      newFontSize = state.originalTextProps.fontSize + dy;
    }

    const minFontSize = 8 / canvas.height;
    const maxFontSize = 200 / canvas.height;
    newFontSize = Math.max(minFontSize, Math.min(maxFontSize, newFontSize));

    selectedText.fontSize = newFontSize;

    const actualFontSize = newFontSize * canvas.height;
    ctx.font = `${actualFontSize}px Arial`;
    const newWidth = ctx.measureText(selectedText.text).width;
    selectedText.width = newWidth / canvas.width;

    redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
    return state;
  }

  if (state.resizing && selectedImage && state.originalImageProps) {
    const p = getCanvasPosition(e, canvas);
    const dx = (p.x - state.dragStartPos.x) / canvas.width;
    const dy = (p.y - state.dragStartPos.y) / canvas.height;

    const handle = state.resizeHandle;
    let newX = state.originalImageProps.x;
    let newY = state.originalImageProps.y;
    let newWidth = state.originalImageProps.width;
    let newHeight = state.originalImageProps.height;

    // Calculate aspect ratio
    const aspectRatio =
      state.originalImageProps.width / state.originalImageProps.height;

    // Handle corner resizing (maintain aspect ratio)
    if (handle === "br") {
      newWidth = state.originalImageProps.width + dx;
      newHeight = newWidth / aspectRatio;
    } else if (handle === "bl") {
      newWidth = state.originalImageProps.width - dx;
      newHeight = newWidth / aspectRatio;
      newX = state.originalImageProps.x + dx;
    } else if (handle === "tr") {
      newWidth = state.originalImageProps.width + dx;
      newHeight = newWidth / aspectRatio;
      newY = state.originalImageProps.y + dy;
    } else if (handle === "tl") {
      newWidth = state.originalImageProps.width - dx;
      newHeight = newWidth / aspectRatio;
      newX = state.originalImageProps.x + dx;
      newY =
        state.originalImageProps.y +
        (state.originalImageProps.height - newHeight);
    }
    // Handle edge resizing (free form)
    else if (handle === "r") {
      newWidth = state.originalImageProps.width + dx;
    } else if (handle === "l") {
      newWidth = state.originalImageProps.width - dx;
      newX = state.originalImageProps.x + dx;
    } else if (handle === "b") {
      newHeight = state.originalImageProps.height + dy;
    } else if (handle === "t") {
      newHeight = state.originalImageProps.height - dy;
      newY = state.originalImageProps.y + dy;
    }

    // Set minimum size
    const minSize = 20 / canvas.width;
    if (newWidth > minSize && newHeight > minSize) {
      selectedImage.x = newX;
      selectedImage.y = newY;
      selectedImage.width = newWidth;
      selectedImage.height = newHeight;
    }

    redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
    return state;
  }

  // Handle shape resizing
  if (state.resizing && selectedShape && state.originalShapeProps) {
    const p = getCanvasPosition(e, canvas);
    const dx = (p.x - state.dragStartPos.x) / canvas.width;
    const dy = (p.y - state.dragStartPos.y) / canvas.height;

    const handle = state.resizeHandle;
    let newStartX = state.originalShapeProps.startX;
    let newStartY = state.originalShapeProps.startY;
    let newEndX = state.originalShapeProps.endX;
    let newEndY = state.originalShapeProps.endY;

    // Handle corner resizing
    if (handle === "br") {
      newEndX = state.originalShapeProps.endX + dx;
      newEndY = state.originalShapeProps.endY + dy;
    } else if (handle === "bl") {
      newStartX = state.originalShapeProps.startX + dx;
      newEndY = state.originalShapeProps.endY + dy;
    } else if (handle === "tr") {
      newEndX = state.originalShapeProps.endX + dx;
      newStartY = state.originalShapeProps.startY + dy;
    } else if (handle === "tl") {
      newStartX = state.originalShapeProps.startX + dx;
      newStartY = state.originalShapeProps.startY + dy;
    }
    // Handle edge resizing
    else if (handle === "r") {
      newEndX = state.originalShapeProps.endX + dx;
    } else if (handle === "l") {
      newStartX = state.originalShapeProps.startX + dx;
    } else if (handle === "b") {
      newEndY = state.originalShapeProps.endY + dy;
    } else if (handle === "t") {
      newStartY = state.originalShapeProps.startY + dy;
    }

    selectedShape.startX = newStartX;
    selectedShape.startY = newStartY;
    selectedShape.endX = newEndX;
    selectedShape.endY = newEndY;

    redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
    return state;
  }

  // Handle pen stroke resizing
  if (state.resizing && selectedStroke && state.originalStrokeProps) {
    const p = getCanvasPosition(e, canvas);
    const dx = (p.x - state.dragStartPos.x) / canvas.width;
    const dy = (p.y - state.dragStartPos.y) / canvas.height;

    const handle = state.resizeHandle;
    const origWidth =
      state.originalStrokeProps.maxX - state.originalStrokeProps.minX;
    const origHeight =
      state.originalStrokeProps.maxY - state.originalStrokeProps.minY;

    let scaleX = 1;
    let scaleY = 1;
    let offsetX = 0;
    let offsetY = 0;

    // Calculate scale and offset based on handle
    if (handle === "br") {
      scaleX = (origWidth + dx) / origWidth;
      scaleY = (origHeight + dy) / origHeight;
    } else if (handle === "bl") {
      scaleX = (origWidth - dx) / origWidth;
      scaleY = (origHeight + dy) / origHeight;
      offsetX = dx;
    } else if (handle === "tr") {
      scaleX = (origWidth + dx) / origWidth;
      scaleY = (origHeight - dy) / origHeight;
      offsetY = dy;
    } else if (handle === "tl") {
      scaleX = (origWidth - dx) / origWidth;
      scaleY = (origHeight - dy) / origHeight;
      offsetX = dx;
      offsetY = dy;
    } else if (handle === "r") {
      scaleX = (origWidth + dx) / origWidth;
    } else if (handle === "l") {
      scaleX = (origWidth - dx) / origWidth;
      offsetX = dx;
    } else if (handle === "b") {
      scaleY = (origHeight + dy) / origHeight;
    } else if (handle === "t") {
      scaleY = (origHeight - dy) / origHeight;
      offsetY = dy;
    }

    // Apply transformation to all points
    selectedStroke.points = state.originalStrokeProps.points.map((pt) => {
      const relX = pt.x - state.originalStrokeProps.minX;
      const relY = pt.y - state.originalStrokeProps.minY;
      return {
        x: state.originalStrokeProps.minX + offsetX + relX * scaleX,
        y: state.originalStrokeProps.minY + offsetY + relY * scaleY,
      };
    });

    redrawStrokes(ctx, pageIndex, canvas.width, canvas.height);
    return state;
  }

  return state;
}

function handleSelectStop(state) {
  return {
    resizing: false,
    dragStartPos: null,
    resizeHandle: null,
    originalTextProps: null,
    originalImageProps: null,
    originalShapeProps: null,
    originalStrokeProps: null,
  };
}
