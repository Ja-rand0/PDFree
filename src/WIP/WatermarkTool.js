// WatermarkTool.js - Add watermarks to PDF pages
// Future Feature - NOT YET IMPLEMENTED

/*
 * PLANNED FEATURES:
 *
 * 1. Text Watermark
 *    - Custom text (e.g., "CONFIDENTIAL", "DRAFT")
 *    - Configurable: font, size, color, opacity, rotation
 *    - Position: center, corners, tiled
 *
 * 2. Image Watermark
 *    - Upload logo/image
 *    - Configurable: size, opacity, position
 *
 * 3. Apply Options
 *    - All pages
 *    - Specific page range
 *    - Odd/even pages only
 *
 * STROKE FORMAT:
 * {
 *   type: "watermark",
 *   watermarkType: "text" | "image",
 *   text: string (for text watermarks),
 *   dataUrl: string (for image watermarks),
 *   fontSize: number,
 *   color: color string,
 *   opacity: 0-1,
 *   rotation: degrees,
 *   position: "center" | "tl" | "tr" | "bl" | "br" | "tiled",
 *   scale: number (for images)
 * }
 */

const defaultWatermarkConfig = {
  text: "CONFIDENTIAL",
  fontSize: 72,
  color: "#888888",
  opacity: 0.3,
  rotation: -45,
  position: "center",
};

let watermarkConfig = { ...defaultWatermarkConfig };

function setWatermarkConfig(config) {
  watermarkConfig = { ...watermarkConfig, ...config };
}

function resetWatermarkConfig() {
  watermarkConfig = { ...defaultWatermarkConfig };
}

// ========== TEXT WATERMARK ==========

function renderTextWatermark(ctx, config, canvasWidth, canvasHeight) {
  const { text, fontSize, color, opacity, rotation, position } = {
    ...defaultWatermarkConfig,
    ...config,
  };

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (position === "center") {
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillText(text, 0, 0);
  } else if (position === "tiled") {
    const spacing = fontSize * 3;
    ctx.rotate((rotation * Math.PI) / 180);

    for (let y = -canvasHeight; y < canvasHeight * 2; y += spacing) {
      for (let x = -canvasWidth; x < canvasWidth * 2; x += spacing) {
        ctx.fillText(text, x, y);
      }
    }
  } else {
    // Corner positions
    const padding = 50;
    let x, y;

    switch (position) {
      case "tl":
        x = padding;
        y = padding;
        break;
      case "tr":
        x = canvasWidth - padding;
        y = padding;
        break;
      case "bl":
        x = padding;
        y = canvasHeight - padding;
        break;
      case "br":
        x = canvasWidth - padding;
        y = canvasHeight - padding;
        break;
      default:
        x = canvasWidth / 2;
        y = canvasHeight / 2;
    }

    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillText(text, 0, 0);
  }

  ctx.restore();
}

// ========== IMAGE WATERMARK ==========

function renderImageWatermark(ctx, config, canvasWidth, canvasHeight, img) {
  if (!img) return;

  const { opacity, position, scale = 0.3 } = config;

  const imgWidth = img.width * scale;
  const imgHeight = img.height * scale;

  ctx.save();
  ctx.globalAlpha = opacity;

  let x, y;

  switch (position) {
    case "center":
      x = (canvasWidth - imgWidth) / 2;
      y = (canvasHeight - imgHeight) / 2;
      break;
    case "tl":
      x = 20;
      y = 20;
      break;
    case "tr":
      x = canvasWidth - imgWidth - 20;
      y = 20;
      break;
    case "bl":
      x = 20;
      y = canvasHeight - imgHeight - 20;
      break;
    case "br":
      x = canvasWidth - imgWidth - 20;
      y = canvasHeight - imgHeight - 20;
      break;
    default:
      x = (canvasWidth - imgWidth) / 2;
      y = (canvasHeight - imgHeight) / 2;
  }

  ctx.drawImage(img, x, y, imgWidth, imgHeight);
  ctx.restore();
}

// ========== APPLY TO PAGES ==========

function applyWatermarkToAllPages(config) {
  // TODO: Implement - add watermark to each page's stroke history
  console.log("Apply watermark to all pages not yet implemented");
}

function applyWatermarkToPageRange(config, startPage, endPage) {
  // TODO: Implement
  console.log("Apply watermark to page range not yet implemented");
}

function removeWatermarksFromPage(pageIndex) {
  // TODO: Implement - remove watermark strokes from page
  console.log("Remove watermarks not yet implemented");
}
