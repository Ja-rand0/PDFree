// Signature tool with drawing modal and cursor preview - stores as vector paths

let signaturePoints = [];
let signatureDrawing = false;
let signatureModal = null;
let signatureCanvas = null;
let signatureCtx = null;
let cursorPreview = null;

function initSignatureModal() {
  if (signatureModal) return;

  // Create modal overlay
  signatureModal = document.createElement("div");
  signatureModal.className = "hidden";
  signatureModal.id = "signatureModal";

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.className = "signature-modal-content";
  modalContent.innerHTML = `
    <h3 class="signature-modal-title">Draw Your Signature</h3>
    <div class="signature-canvas-container">
      <canvas id="signatureCanvas" width="400" height="200"></canvas>
    </div>
    <div class="signature-modal-buttons">
      <button id="signatureClear" class="signature-btn signature-btn-clear">Clear</button>
      <button id="signatureClose" class="signature-btn signature-btn-close">Close</button>
      <button id="signatureDone" class="signature-btn signature-btn-done">Done</button>
    </div>
  `;

  signatureModal.appendChild(modalContent);
  document.body.appendChild(signatureModal);

  // Get canvas and context
  signatureCanvas = document.getElementById("signatureCanvas");
  signatureCtx = signatureCanvas.getContext("2d");

  // Setup canvas drawing
  setupSignatureCanvas();

  // Setup buttons
  document
    .getElementById("signatureClear")
    .addEventListener("click", clearSignatureCanvas);
  document
    .getElementById("signatureClose")
    .addEventListener("click", closeSignatureModal);
  document
    .getElementById("signatureDone")
    .addEventListener("click", saveSignature);

  // Create cursor preview element
  cursorPreview = document.createElement("div");
  cursorPreview.id = "signatureCursorPreview";
  cursorPreview.className = "fixed pointer-events-none z-40 hidden";
  cursorPreview.style.border = "2px dashed #3b82f6";
  cursorPreview.style.background = "rgba(59, 130, 246, 0.1)";
  cursorPreview.style.borderRadius = "4px";
  document.body.appendChild(cursorPreview);
}

function setupSignatureCanvas() {
  let isDrawing = false;
  let currentStroke = [];

  signatureCanvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStroke = [{ x, y }];
    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
  });

  signatureCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStroke.push({ x, y });
    signatureCtx.lineTo(x, y);
    signatureCtx.strokeStyle = "#000000";
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = "round";
    signatureCtx.lineJoin = "round";
    signatureCtx.stroke();
  });

  signatureCanvas.addEventListener("mouseup", () => {
    if (isDrawing && currentStroke.length > 0) {
      signaturePoints.push([...currentStroke]);
    }
    isDrawing = false;
  });

  signatureCanvas.addEventListener("mouseleave", () => {
    if (isDrawing && currentStroke.length > 0) {
      signaturePoints.push([...currentStroke]);
    }
    isDrawing = false;
  });

  // Touch support
  signatureCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    currentStroke = [{ x, y }];
    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
  });

  signatureCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const rect = signatureCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    currentStroke.push({ x, y });
    signatureCtx.lineTo(x, y);
    signatureCtx.strokeStyle = "#000000";
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = "round";
    signatureCtx.lineJoin = "round";
    signatureCtx.stroke();
  });

  signatureCanvas.addEventListener("touchend", () => {
    if (isDrawing && currentStroke.length > 0) {
      signaturePoints.push([...currentStroke]);
    }
    isDrawing = false;
  });
}

function clearSignatureCanvas() {
  signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  signaturePoints = [];
}

function openSignatureModal() {
  initSignatureModal();
  signatureModal.classList.remove("hidden");
  clearSignatureCanvas();
}

function closeSignatureModal() {
  signatureModal.classList.add("hidden");
  hideCursorPreview();
}

function saveSignature() {
  if (signaturePoints.length === 0) {
    alert("Please draw a signature first");
    return;
  }

  // Close modal
  signatureModal.classList.add("hidden");

  // Show cursor preview
  showCursorPreview();

  console.log("Signature saved with", signaturePoints.length, "strokes");
}

function showCursorPreview() {
  if (signaturePoints.length === 0 || !cursorPreview) return;

  // Calculate bounding box of signature
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  signaturePoints.forEach((stroke) => {
    stroke.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const previewScale = 100 / width; // Scale to 100px wide

  cursorPreview.style.width = `${width * previewScale}px`;
  cursorPreview.style.height = `${height * previewScale}px`;
  cursorPreview.classList.remove("hidden");

  // Add cursor tracking
  document.addEventListener("mousemove", updateCursorPreview);
}

function updateCursorPreview(e) {
  if (!cursorPreview || cursorPreview.classList.contains("hidden")) return;

  const width = parseFloat(cursorPreview.style.width);
  const height = parseFloat(cursorPreview.style.height);

  cursorPreview.style.left = `${e.clientX - width / 2}px`;
  cursorPreview.style.top = `${e.clientY - height / 2}px`;
}

function hideCursorPreview() {
  if (cursorPreview) {
    cursorPreview.classList.add("hidden");
    document.removeEventListener("mousemove", updateCursorPreview);
  }
}

function handleSignatureClick(e, canvas, pageIndex) {
  if (signaturePoints.length === 0) {
    // No signature drawn yet, open modal
    openSignatureModal();
    return;
  }

  // Calculate bounding box of original signature
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  signaturePoints.forEach((stroke) => {
    stroke.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  const sigWidth = maxX - minX;
  const sigHeight = maxY - minY;

  // Create an offscreen canvas to render the signature as an image
  const padding = 10;
  const offCanvas = document.createElement("canvas");
  offCanvas.width = sigWidth + padding * 2;
  offCanvas.height = sigHeight + padding * 2;
  const offCtx = offCanvas.getContext("2d");

  // Draw signature strokes onto offscreen canvas
  offCtx.strokeStyle = "#000000";
  offCtx.lineWidth = 2;
  offCtx.lineCap = "round";
  offCtx.lineJoin = "round";

  signaturePoints.forEach((stroke) => {
    if (stroke.length === 0) return;
    offCtx.beginPath();
    offCtx.moveTo(stroke[0].x - minX + padding, stroke[0].y - minY + padding);
    for (let i = 1; i < stroke.length; i++) {
      offCtx.lineTo(stroke[i].x - minX + padding, stroke[i].y - minY + padding);
    }
    offCtx.stroke();
  });

  // Convert to data URL
  const dataUrl = offCanvas.toDataURL("image/png");

  // Get click position
  const p = getCanvasPosition(e, canvas);

  // Calculate target size (15% of canvas width, maintaining aspect ratio)
  const targetWidth = canvas.width * 0.15;
  const scale = targetWidth / (sigWidth + padding * 2);
  const targetHeight = (sigHeight + padding * 2) * scale;

  // Create a single signature-image object (like regular images)
  const signatureImage = {
    type: "signature-image",
    dataUrl: dataUrl,
    x: (p.x - targetWidth / 2) / canvas.width,
    y: (p.y - targetHeight / 2) / canvas.height,
    width: targetWidth / canvas.width,
    height: targetHeight / canvas.height,
    originalWidth: sigWidth + padding * 2,
    originalHeight: sigHeight + padding * 2,
  };

  strokeHistory[pageIndex].push(signatureImage);
  undoStacks[pageIndex].push(signatureImage);
  redoStacks[pageIndex].length = 0;

  // Redraw to show signature
  redrawStrokes(
    canvas.getContext("2d"),
    pageIndex,
    canvas.width,
    canvas.height
  );

  console.log("Placed signature as single image object");
}

// When signature tool is deactivated, hide preview
function deactivateSignatureTool() {
  hideCursorPreview();
}
