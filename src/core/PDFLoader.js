// PDF loading and rendering functions

async function loadFile(url) {
  const res = await fetch(url);
  pdfBytes = await res.arrayBuffer();

  const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
  sessionStorage.setItem("pdfData", base64);

  strokeHistory.length = 0;
  undoStacks.length = 0;
  redoStacks.length = 0;
  zoom = 1;

  await renderPages();
  document.getElementById("zoomTxt").textContent = "100%";
}

async function renderPages() {
  if (isRendering) {
    console.log("Already rendering, will process pending zoom after...");
    return;
  }

  isRendering = true;
  pendingZoom = null;
  console.log("renderPages called, zoom:", zoom);

  try {
    const wrap = document.getElementById("canvasWrap");
    wrap.innerHTML = "";
    pages = [];

    const base64Data = sessionStorage.getItem("pdfData");
    if (!base64Data) {
      console.error("No PDF data in sessionStorage");
      return;
    }
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const data = bytes;
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    console.log("PDF loaded, numPages:", pdf.numPages);

    for (let i = 0; i < pdf.numPages; i++) {
      const pdfPage = await pdf.getPage(i + 1);
      const viewport = pdfPage.getViewport({ scale: 1.5 * zoom });

      const box = document.createElement("div");
      box.className = "relative";

      const pdfCanvas = document.createElement("canvas");
      pdfCanvas.className = "pageCanvas";
      pdfCanvas.width = viewport.width;
      pdfCanvas.height = viewport.height;

      const inkC = document.createElement("canvas");
      inkC.width = viewport.width;
      inkC.height = viewport.height;
      inkC.className = "inkCanvasTouch";

      box.appendChild(pdfCanvas);
      box.appendChild(inkC);
      wrap.appendChild(box);

      await pdfPage.render({
        canvasContext: pdfCanvas.getContext("2d"),
        viewport,
      }).promise;

      const ctx = inkC.getContext("2d");
      pages.push({
        inkC,
        ctx,
        baseWidth: viewport.width,
        baseHeight: viewport.height,
      });

      if (!strokeHistory[i]) {
        strokeHistory[i] = [];
        undoStacks[i] = [];
        redoStacks[i] = [];
      }

      redrawStrokes(ctx, i, viewport.width, viewport.height);
      attachCanvasListeners(inkC, i);
    }

    console.log("renderPages complete, pages:", pages.length);
  } finally {
    isRendering = false;

    if (pendingZoom !== null) {
      console.log("Processing pending zoom:", pendingZoom);
      zoom = pendingZoom;
      applyZoom();
    }
  }
}

function redrawStrokes(ctx, pageIndex, canvasWidth, canvasHeight) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const strokes = strokeHistory[pageIndex];
  if (!strokes) return;

  // Collect images to render last
  const imageStrokes = [];

  strokes.forEach((stroke) => {
    if (stroke.type === "text") {
      const x = stroke.x * canvasWidth;
      const y = stroke.y * canvasHeight;
      const fontSize = stroke.fontSize * canvasHeight;
      const textWidth = stroke.width * canvasWidth;

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = stroke.color;
      ctx.fillText(stroke.text, x, y);

      const isSelected =
        selectedText === stroke &&
        selectedPageIndex === pageIndex &&
        (!selectedObjects || selectedObjects.length <= 1);

      if (isSelected) {
        const boxX = x - 2;
        const boxY = y - fontSize;
        const boxW = textWidth + 4;
        const boxH = fontSize + 7;
        const cornerRadius = 4;

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(boxX + cornerRadius, boxY);
        ctx.lineTo(boxX + boxW - cornerRadius, boxY);
        ctx.arcTo(
          boxX + boxW,
          boxY,
          boxX + boxW,
          boxY + cornerRadius,
          cornerRadius
        );
        ctx.lineTo(boxX + boxW, boxY + boxH - cornerRadius);
        ctx.arcTo(
          boxX + boxW,
          boxY + boxH,
          boxX + boxW - cornerRadius,
          boxY + boxH,
          cornerRadius
        );
        ctx.lineTo(boxX + cornerRadius, boxY + boxH);
        ctx.arcTo(
          boxX,
          boxY + boxH,
          boxX,
          boxY + boxH - cornerRadius,
          cornerRadius
        );
        ctx.lineTo(boxX, boxY + cornerRadius);
        ctx.arcTo(boxX, boxY, boxX + cornerRadius, boxY, cornerRadius);
        ctx.closePath();
        ctx.stroke();

        ctx.setLineDash([]);

        const handleSize = 8;
        ctx.fillStyle = "#000000";

        ctx.fillRect(
          boxX - handleSize / 2,
          boxY - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxX + boxW - handleSize / 2,
          boxY - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxX - handleSize / 2,
          boxY + boxH - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxX + boxW - handleSize / 2,
          boxY + boxH - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxX + boxW / 2 - handleSize / 2,
          boxY - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxX + boxW / 2 - handleSize / 2,
          boxY + boxH - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxX - handleSize / 2,
          boxY + boxH / 2 - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxX + boxW - handleSize / 2,
          boxY + boxH / 2 - handleSize / 2,
          handleSize,
          handleSize
        );
      }
    } else if (stroke.type === "highlight") {
      // Draw highlight stroke with transparency
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      stroke.points.forEach((point, idx) => {
        const x = point.x * canvasWidth;
        const y = point.y * canvasHeight;

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (stroke.type === "shape") {
      // Draw shape
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const startX = stroke.startX * canvasWidth;
      const startY = stroke.startY * canvasHeight;
      const endX = stroke.endX * canvasWidth;
      const endY = stroke.endY * canvasHeight;

      if (stroke.shapeType === "rectangle") {
        const width = endX - startX;
        const height = endY - startY;
        ctx.strokeRect(startX, startY, width, height);
      } else if (stroke.shapeType === "circle") {
        const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (stroke.shapeType === "line") {
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      } else if (stroke.shapeType === "arrow") {
        // Draw line
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle - arrowAngle),
          endY - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle + arrowAngle),
          endY - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
      }

      // Draw selection box if selected
      const isSelected =
        selectedShape === stroke &&
        selectedPageIndex === pageIndex &&
        (!selectedObjects || selectedObjects.length <= 1);
      if (isSelected) {
        let left, top, width, height;

        if (stroke.shapeType === "circle") {
          // For circles, calculate bounding box from radius
          const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
          left = startX - radius;
          top = startY - radius;
          width = radius * 2;
          height = radius * 2;
        } else {
          // For other shapes, use min/max of start and end points
          left = Math.min(startX, endX);
          top = Math.min(startY, endY);
          width = Math.abs(endX - startX);
          height = Math.abs(endY - startY);
        }

        // Draw dashed border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(left - 5, top - 5, width + 10, height + 10);
        ctx.setLineDash([]);

        // Draw resize handles (8 corner and edge handles)
        const handleSize = 8;
        ctx.fillStyle = "#000000";

        // Corners
        ctx.fillRect(
          left - 5 - handleSize / 2,
          top - 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // TL
        ctx.fillRect(
          left + width + 5 - handleSize / 2,
          top - 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // TR
        ctx.fillRect(
          left - 5 - handleSize / 2,
          top + height + 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // BL
        ctx.fillRect(
          left + width + 5 - handleSize / 2,
          top + height + 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // BR

        // Edges
        ctx.fillRect(
          left + width / 2 - handleSize / 2,
          top - 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // Top
        ctx.fillRect(
          left + width / 2 - handleSize / 2,
          top + height + 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // Bottom
        ctx.fillRect(
          left - 5 - handleSize / 2,
          top + height / 2 - handleSize / 2,
          handleSize,
          handleSize
        ); // Left
        ctx.fillRect(
          left + width + 5 - handleSize / 2,
          top + height / 2 - handleSize / 2,
          handleSize,
          handleSize
        ); // Right
      }
    } else if (stroke.type === "signature") {
      // Draw signature (same as pen stroke)
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      stroke.points.forEach((point, idx) => {
        const x = point.x * canvasWidth;
        const y = point.y * canvasHeight;

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    } else if (stroke.type === "signature-image") {
      // Draw signature image (same as regular image)
      if (stroke.imgObject) {
        const x = stroke.x * canvasWidth;
        const y = stroke.y * canvasHeight;
        const width = stroke.width * canvasWidth;
        const height = stroke.height * canvasHeight;

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(stroke.imgObject, x, y, width, height);
        ctx.restore();

        // Draw selection box if selected
        const isSelected =
          selectedSignature === stroke &&
          selectedPageIndex === pageIndex &&
          (!selectedObjects || selectedObjects.length <= 1);
        if (isSelected) {
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
          ctx.setLineDash([]);
        }
      } else {
        const img = new Image();
        img.onload = () => {
          const x = stroke.x * canvasWidth;
          const y = stroke.y * canvasHeight;
          const width = stroke.width * canvasWidth;
          const height = stroke.height * canvasHeight;

          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.drawImage(img, x, y, width, height);
          ctx.restore();

          stroke.imgObject = img;
        };
        img.src = stroke.dataUrl;
      }
    } else if (stroke.type === "stamp") {
      // Draw stamp
      const x = stroke.x * canvasWidth;
      const y = stroke.y * canvasHeight;
      const fontSize = stroke.fontSize * canvasHeight;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((stroke.rotation * Math.PI) / 180);

      // Draw border box
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const textMetrics = ctx.measureText(stroke.text);
      const textWidth = textMetrics.width;
      const padding = 10;

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

      // Draw selection box if selected
      const isSelected =
        selectedStamp === stroke &&
        selectedPageIndex === pageIndex &&
        (!selectedObjects || selectedObjects.length <= 1);
      if (isSelected) {
        const stampWidth = stroke.width * canvasWidth;
        const stampHeight = stroke.height * canvasHeight;

        // Stamps are centered at x,y
        const left = x - stampWidth / 2;
        const top = y - stampHeight / 2;

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(left - 5, top - 5, stampWidth + 10, stampHeight + 10);
        ctx.setLineDash([]);

        // Draw resize handles
        const handleSize = 8;
        ctx.fillStyle = "#000000";
        const boxLeft = left - 5;
        const boxTop = top - 5;
        const boxWidth = stampWidth + 10;
        const boxHeight = stampHeight + 10;

        // Corners
        ctx.fillRect(
          boxLeft - handleSize / 2,
          boxTop - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxLeft + boxWidth - handleSize / 2,
          boxTop - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxLeft - handleSize / 2,
          boxTop + boxHeight - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxLeft + boxWidth - handleSize / 2,
          boxTop + boxHeight - handleSize / 2,
          handleSize,
          handleSize
        );

        // Edges
        ctx.fillRect(
          boxLeft + boxWidth / 2 - handleSize / 2,
          boxTop - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxLeft + boxWidth / 2 - handleSize / 2,
          boxTop + boxHeight - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxLeft - handleSize / 2,
          boxTop + boxHeight / 2 - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.fillRect(
          boxLeft + boxWidth - handleSize / 2,
          boxTop + boxHeight / 2 - handleSize / 2,
          handleSize,
          handleSize
        );
      }
    } else if (stroke.type === "image") {
      // Draw image synchronously using pre-loaded object
      if (stroke.imgObject) {
        // Image already loaded - draw immediately
        const x = stroke.x * canvasWidth;
        const y = stroke.y * canvasHeight;
        const width = stroke.width * canvasWidth;
        const height = stroke.height * canvasHeight;

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(stroke.imgObject, x, y, width, height);
        ctx.restore();

        // Draw selection box if selected
        const isSelected =
          selectedImage === stroke &&
          selectedPageIndex === pageIndex &&
          (!selectedObjects || selectedObjects.length <= 1);
        if (isSelected) {
          const cornerRadius = 4;

          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.setLineDash([]);

          // Draw rounded rectangle border
          ctx.beginPath();
          ctx.moveTo(x + cornerRadius, y);
          ctx.lineTo(x + width - cornerRadius, y);
          ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
          ctx.lineTo(x + width, y + height - cornerRadius);
          ctx.arcTo(
            x + width,
            y + height,
            x + width - cornerRadius,
            y + height,
            cornerRadius
          );
          ctx.lineTo(x + cornerRadius, y + height);
          ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
          ctx.lineTo(x, y + cornerRadius);
          ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
          ctx.closePath();
          ctx.stroke();

          // Draw resize handles
          const handleSize = 8;
          ctx.fillStyle = "#000000";

          // Corner handles
          ctx.fillRect(
            x - handleSize / 2,
            y - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.fillRect(
            x + width - handleSize / 2,
            y - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.fillRect(
            x - handleSize / 2,
            y + height - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.fillRect(
            x + width - handleSize / 2,
            y + height - handleSize / 2,
            handleSize,
            handleSize
          );

          // Edge handles
          ctx.fillRect(
            x + width / 2 - handleSize / 2,
            y - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.fillRect(
            x + width / 2 - handleSize / 2,
            y + height - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.fillRect(
            x - handleSize / 2,
            y + height / 2 - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.fillRect(
            x + width - handleSize / 2,
            y + height / 2 - handleSize / 2,
            handleSize,
            handleSize
          );
        }
      } else {
        // Fallback: load image if not pre-loaded (for undo/redo)
        const img = new Image();
        img.onload = () => {
          const x = stroke.x * canvasWidth;
          const y = stroke.y * canvasHeight;
          const width = stroke.width * canvasWidth;
          const height = stroke.height * canvasHeight;

          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.drawImage(img, x, y, width, height);
          ctx.restore();

          // Store for future renders
          stroke.imgObject = img;
        };
        img.src = stroke.dataUrl;
      }
    } else {
      // Draw pen stroke
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      stroke.points.forEach((point, idx) => {
        const x = point.x * canvasWidth;
        const y = point.y * canvasHeight;

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw selection box if selected
      const isSelected =
        selectedStroke === stroke &&
        selectedPageIndex === pageIndex &&
        (!selectedObjects || selectedObjects.length <= 1);
      if (isSelected && stroke.points && stroke.points.length > 0) {
        // Calculate bounding box from all points
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        stroke.points.forEach((point) => {
          const px = point.x * canvasWidth;
          const py = point.y * canvasHeight;
          minX = Math.min(minX, px);
          minY = Math.min(minY, py);
          maxX = Math.max(maxX, px);
          maxY = Math.max(maxY, py);
        });

        const width = maxX - minX;
        const height = maxY - minY;

        // Draw dashed border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(minX - 5, minY - 5, width + 10, height + 10);
        ctx.setLineDash([]);

        // Draw resize handles (8 corner and edge handles)
        const handleSize = 8;
        ctx.fillStyle = "#000000";

        // Corners
        ctx.fillRect(
          minX - 5 - handleSize / 2,
          minY - 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // TL
        ctx.fillRect(
          maxX + 5 - handleSize / 2,
          minY - 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // TR
        ctx.fillRect(
          minX - 5 - handleSize / 2,
          maxY + 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // BL
        ctx.fillRect(
          maxX + 5 - handleSize / 2,
          maxY + 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // BR

        // Edges
        ctx.fillRect(
          minX + width / 2 - handleSize / 2,
          minY - 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // Top
        ctx.fillRect(
          minX + width / 2 - handleSize / 2,
          maxY + 5 - handleSize / 2,
          handleSize,
          handleSize
        ); // Bottom
        ctx.fillRect(
          minX - 5 - handleSize / 2,
          minY + height / 2 - handleSize / 2,
          handleSize,
          handleSize
        ); // Left
        ctx.fillRect(
          maxX + 5 - handleSize / 2,
          minY + height / 2 - handleSize / 2,
          handleSize,
          handleSize
        ); // Right
      }
    }
  });

  // Draw unified selection box for multi-select
  if (
    selectedObjects &&
    selectedObjects.length > 1 &&
    selectedPageIndex === pageIndex
  ) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    // Calculate bounding box around all selected objects
    selectedObjects.forEach((obj) => {
      let objBounds = null;

      if (obj.type === "text") {
        const x = obj.x * canvasWidth;
        const y = obj.y * canvasHeight;
        const fontSize = obj.fontSize * canvasHeight;
        const width = obj.width * canvasWidth;
        objBounds = { left: x, top: y - fontSize, right: x + width, bottom: y };
      } else if (obj.type === "image" || obj.type === "signature-image") {
        const x = obj.x * canvasWidth;
        const y = obj.y * canvasHeight;
        objBounds = {
          left: x,
          top: y,
          right: x + obj.width * canvasWidth,
          bottom: y + obj.height * canvasHeight,
        };
      } else if (obj.type === "shape") {
        const startX = obj.startX * canvasWidth;
        const startY = obj.startY * canvasHeight;
        const endX = obj.endX * canvasWidth;
        const endY = obj.endY * canvasHeight;
        if (obj.shapeType === "circle") {
          const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
          objBounds = {
            left: startX - radius,
            top: startY - radius,
            right: startX + radius,
            bottom: startY + radius,
          };
        } else {
          objBounds = {
            left: Math.min(startX, endX),
            top: Math.min(startY, endY),
            right: Math.max(startX, endX),
            bottom: Math.max(startY, endY),
          };
        }
      } else if (obj.type === "stamp") {
        const x = obj.x * canvasWidth;
        const y = obj.y * canvasHeight;
        const w = obj.width * canvasWidth;
        const h = obj.height * canvasHeight;
        objBounds = {
          left: x - w / 2,
          top: y - h / 2,
          right: x + w / 2,
          bottom: y + h / 2,
        };
      } else if (obj.points && obj.points.length > 0) {
        // Handle pen strokes (may not have type property)
        let pMinX = Infinity,
          pMinY = Infinity,
          pMaxX = -Infinity,
          pMaxY = -Infinity;
        obj.points.forEach((pt) => {
          const px = pt.x * canvasWidth;
          const py = pt.y * canvasHeight;
          pMinX = Math.min(pMinX, px);
          pMinY = Math.min(pMinY, py);
          pMaxX = Math.max(pMaxX, px);
          pMaxY = Math.max(pMaxY, py);
        });
        objBounds = { left: pMinX, top: pMinY, right: pMaxX, bottom: pMaxY };
      }

      if (objBounds) {
        minX = Math.min(minX, objBounds.left);
        minY = Math.min(minY, objBounds.top);
        maxX = Math.max(maxX, objBounds.right);
        maxY = Math.max(maxY, objBounds.bottom);
      }
    });

    // Draw unified selection border
    const padding = 10;
    const boxLeft = minX - padding;
    const boxTop = minY - padding;
    const boxWidth = maxX - minX + padding * 2;
    const boxHeight = maxY - minY + padding * 2;

    ctx.strokeStyle = "#2196F3";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(boxLeft, boxTop, boxWidth, boxHeight);
    ctx.setLineDash([]);

    // Draw 8 resize handles
    const handleSize = 8;
    ctx.fillStyle = "#2196F3";

    // Corners
    ctx.fillRect(
      boxLeft - handleSize / 2,
      boxTop - handleSize / 2,
      handleSize,
      handleSize
    ); // TL
    ctx.fillRect(
      boxLeft + boxWidth - handleSize / 2,
      boxTop - handleSize / 2,
      handleSize,
      handleSize
    ); // TR
    ctx.fillRect(
      boxLeft - handleSize / 2,
      boxTop + boxHeight - handleSize / 2,
      handleSize,
      handleSize
    ); // BL
    ctx.fillRect(
      boxLeft + boxWidth - handleSize / 2,
      boxTop + boxHeight - handleSize / 2,
      handleSize,
      handleSize
    ); // BR

    // Edges
    ctx.fillRect(
      boxLeft + boxWidth / 2 - handleSize / 2,
      boxTop - handleSize / 2,
      handleSize,
      handleSize
    ); // Top
    ctx.fillRect(
      boxLeft + boxWidth / 2 - handleSize / 2,
      boxTop + boxHeight - handleSize / 2,
      handleSize,
      handleSize
    ); // Bottom
    ctx.fillRect(
      boxLeft - handleSize / 2,
      boxTop + boxHeight / 2 - handleSize / 2,
      handleSize,
      handleSize
    ); // Left
    ctx.fillRect(
      boxLeft + boxWidth - handleSize / 2,
      boxTop + boxHeight / 2 - handleSize / 2,
      handleSize,
      handleSize
    ); // Right
  }
}
