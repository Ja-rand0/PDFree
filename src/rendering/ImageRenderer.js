// ImageRenderer.js - Render images and signature images

/**
 * Render an image stroke
 */
function renderImage(ctx, stroke, canvasWidth, canvasHeight) {
  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const width = stroke.width * canvasWidth;
  const height = stroke.height * canvasHeight;

  if (stroke.imgObject) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(stroke.imgObject, x, y, width, height);
    ctx.restore();
  } else if (stroke.dataUrl) {
    // Lazy load image
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, x, y, width, height);
      ctx.restore();
      stroke.imgObject = img;
    };
    img.src = stroke.dataUrl;
  }
}

/**
 * Render a signature image (same as regular image)
 */
function renderSignatureImage(ctx, stroke, canvasWidth, canvasHeight) {
  renderImage(ctx, stroke, canvasWidth, canvasHeight);
}

/**
 * Render selection box for an image
 */
function renderImageSelectionBox(
  ctx,
  stroke,
  canvasWidth,
  canvasHeight,
  isSelected
) {
  if (!isSelected) return;

  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const width = stroke.width * canvasWidth;
  const height = stroke.height * canvasHeight;
  const padding = 5;

  // Draw rounded rectangle border
  const cornerRadius = 4;
  const boxX = x - padding;
  const boxY = y - padding;
  const boxW = width + padding * 2;
  const boxH = height + padding * 2;

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(boxX + cornerRadius, boxY);
  ctx.lineTo(boxX + boxW - cornerRadius, boxY);
  ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + cornerRadius, cornerRadius);
  ctx.lineTo(boxX + boxW, boxY + boxH - cornerRadius);
  ctx.arcTo(
    boxX + boxW,
    boxY + boxH,
    boxX + boxW - cornerRadius,
    boxY + boxH,
    cornerRadius
  );
  ctx.lineTo(boxX + cornerRadius, boxY + boxH);
  ctx.arcTo(boxX, boxY + boxH, boxX, boxY + boxH - cornerRadius, cornerRadius);
  ctx.lineTo(boxX, boxY + cornerRadius);
  ctx.arcTo(boxX, boxY, boxX + cornerRadius, boxY, cornerRadius);
  ctx.closePath();
  ctx.stroke();

  // Draw resize handles
  renderResizeHandles(ctx, boxX, boxY, boxW, boxH);
}

/**
 * Render selection box for a signature image
 */
function renderSignatureImageSelectionBox(
  ctx,
  stroke,
  canvasWidth,
  canvasHeight,
  isSelected
) {
  if (!isSelected) return;

  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const width = stroke.width * canvasWidth;
  const height = stroke.height * canvasHeight;
  const padding = 5;

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(
    x - padding,
    y - padding,
    width + padding * 2,
    height + padding * 2
  );
  ctx.setLineDash([]);
}

/**
 * Pre-load an image from dataUrl
 */
function preloadImage(stroke) {
  return new Promise((resolve, reject) => {
    if (stroke.imgObject) {
      resolve(stroke.imgObject);
      return;
    }

    if (!stroke.dataUrl) {
      reject(new Error("No dataUrl for image"));
      return;
    }

    const img = new Image();
    img.onload = () => {
      stroke.imgObject = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = stroke.dataUrl;
  });
}
