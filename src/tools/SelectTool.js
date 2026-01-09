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
  const hitArea = 30;

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

  const hitArea = 30;

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

  // Select or deselect
  selectedText = clickedText;
  selectedImage = clickedImage;
  selectedPageIndex = clickedText || clickedImage ? pageIndex : null;
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

  return state;
}

function handleSelectStop(state) {
  return {
    resizing: false,
    dragStartPos: null,
    resizeHandle: null,
    originalTextProps: null,
    originalImageProps: null,
  };
}
