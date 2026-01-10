// Signature tool with drawing modal and cursor preview

let signatureDataUrl = null;
let signatureDrawing = false;
let signaturePoints = [];
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
  cursorPreview.style.opacity = "0.6";
  document.body.appendChild(cursorPreview);
}

function setupSignatureCanvas() {
  let isDrawing = false;

  signatureCanvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
    signaturePoints = [{ x, y }];
  });

  signatureCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    signatureCtx.lineTo(x, y);
    signatureCtx.strokeStyle = "#000000";
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = "round";
    signatureCtx.lineJoin = "round";
    signatureCtx.stroke();

    signaturePoints.push({ x, y });
  });

  signatureCanvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  signatureCanvas.addEventListener("mouseleave", () => {
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

    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
    signaturePoints = [{ x, y }];
  });

  signatureCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const rect = signatureCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    signatureCtx.lineTo(x, y);
    signatureCtx.strokeStyle = "#000000";
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = "round";
    signatureCtx.lineJoin = "round";
    signatureCtx.stroke();

    signaturePoints.push({ x, y });
  });

  signatureCanvas.addEventListener("touchend", () => {
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

  // Save canvas as data URL
  signatureDataUrl = signatureCanvas.toDataURL("image/png");

  // Close modal
  signatureModal.classList.add("hidden");

  // Show cursor preview
  showCursorPreview();

  console.log("Signature saved, ready to place");
}

function showCursorPreview() {
  if (!signatureDataUrl || !cursorPreview) return;

  const img = new Image();
  img.onload = () => {
    cursorPreview.innerHTML = "";
    cursorPreview.style.width = "100px";
    cursorPreview.style.height = `${(img.height / img.width) * 100}px`;

    const previewImg = document.createElement("img");
    previewImg.src = signatureDataUrl;
    previewImg.style.width = "100%";
    previewImg.style.height = "100%";
    cursorPreview.appendChild(previewImg);

    cursorPreview.classList.remove("hidden");
  };
  img.src = signatureDataUrl;

  // Add cursor tracking
  document.addEventListener("mousemove", updateCursorPreview);
}

function updateCursorPreview(e) {
  if (!cursorPreview || cursorPreview.classList.contains("hidden")) return;

  cursorPreview.style.left = `${e.clientX - 50}px`;
  cursorPreview.style.top = `${e.clientY - 25}px`;
}

function hideCursorPreview() {
  if (cursorPreview) {
    cursorPreview.classList.add("hidden");
    document.removeEventListener("mousemove", updateCursorPreview);
  }
}

function handleSignatureClick(e, canvas, pageIndex) {
  if (!signatureDataUrl) {
    // No signature drawn yet, open modal
    openSignatureModal();
    return;
  }

  // Place signature on canvas
  const p = getCanvasPosition(e, canvas);
  const normalizedX = p.x / canvas.width;
  const normalizedY = p.y / canvas.height;

  const img = new Image();
  img.onload = () => {
    // Calculate aspect ratio
    const aspectRatio = img.height / img.width;
    const signatureWidth = 0.15; // 15% of canvas width
    const signatureHeight = signatureWidth * aspectRatio;

    // Create signature stroke
    const signatureStroke = {
      type: "signature-image",
      dataUrl: signatureDataUrl,
      imgObject: img,
      x: normalizedX - signatureWidth / 2, // Center on click
      y: normalizedY - signatureHeight / 2,
      width: signatureWidth,
      height: signatureHeight,
    };

    strokeHistory[pageIndex].push(signatureStroke);
    undoStacks[pageIndex].push(signatureStroke);
    redoStacks[pageIndex].length = 0;

    // Redraw to show signature
    redrawStrokes(
      canvas.getContext("2d"),
      pageIndex,
      canvas.width,
      canvas.height
    );

    console.log("Signature placed");
  };
  img.src = signatureDataUrl;
}

// When signature tool is deactivated, hide preview
function deactivateSignatureTool() {
  hideCursorPreview();
}
