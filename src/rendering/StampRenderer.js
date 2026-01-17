// StampRenderer.js - Render stamp annotations

/**
 * Render a stamp
 */
function renderStamp(ctx, stroke, canvasWidth, canvasHeight) {
  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const fontSize = stroke.fontSize * canvasHeight;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((stroke.rotation * Math.PI) / 180);

  // Set up text rendering
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Measure text for border
  const textMetrics = ctx.measureText(stroke.text);
  const textWidth = textMetrics.width;
  const padding = 10;

  // Draw border box
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(
    -textWidth / 2 - padding,
    -fontSize / 2 - padding,
    textWidth + padding * 2,
    fontSize + padding * 2
  );

  // Draw text
  ctx.fillStyle = stroke.color;
  ctx.fillText(stroke.text, 0, 0);

  ctx.restore();
}

/**
 * Render selection box for a stamp
 */
function renderStampSelectionBox(
  ctx,
  stroke,
  canvasWidth,
  canvasHeight,
  isSelected
) {
  if (!isSelected) return;

  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const stampWidth = stroke.width * canvasWidth;
  const stampHeight = stroke.height * canvasHeight;

  // Stamps are centered at x,y
  const left = x - stampWidth / 2;
  const top = y - stampHeight / 2;
  const padding = 5;

  // Draw dashed border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(
    left - padding,
    top - padding,
    stampWidth + padding * 2,
    stampHeight + padding * 2
  );
  ctx.setLineDash([]);

  // Draw resize handles
  renderResizeHandles(
    ctx,
    left - padding,
    top - padding,
    stampWidth + padding * 2,
    stampHeight + padding * 2
  );
}

/**
 * Get stamp configuration by type
 */
function getStampConfig(stampType) {
  const stamps = {
    approved: { text: "APPROVED", color: "#00AA00", rotation: 0 },
    rejected: { text: "REJECTED", color: "#FF0000", rotation: 0 },
    confidential: { text: "CONFIDENTIAL", color: "#FF0000", rotation: 0 },
    draft: { text: "DRAFT", color: "#888888", rotation: -15 },
    copy: { text: "COPY", color: "#0066CC", rotation: 0 },
    urgent: { text: "URGENT", color: "#FF6600", rotation: 0 },
    final: { text: "FINAL", color: "#009900", rotation: 0 },
    void: { text: "VOID", color: "#FF0000", rotation: 45 },
    checked: { text: "✓", color: "#00AA00", rotation: 0 },
    xmark: { text: "✗", color: "#FF0000", rotation: 0 },
  };

  return stamps[stampType] || stamps.approved;
}
