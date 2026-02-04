// Toolbar actions and tool switching

function initToolbar() {
  // Helper to deactivate all tool buttons
  function deactivateAllTools() {
    const toolButtons = [
      "selectTool", "moveTool", "penTool", "textTool", "deleteTool",
      "eraserTool", "highlightTool", "imageTool", "shapeTool",
      "signatureTool", "stampTool", "redactionTool", "checkboxTool",
      "dateStampTool", "textFieldTool", "commentTool", "watermarkTool",
      "measurementTool"
    ];

    toolButtons.forEach(toolId => {
      const btn = document.getElementById(toolId);
      if (btn) {
        btn.classList.remove("active");
      }
    });
  }

  // Helper to remove image cursor from all canvases
  function removeImageCursor() {
    pages.forEach((p) => {
      p.inkC.classList.remove("image-cursor");
    });
    // Hide signature cursor preview when switching tools
    if (typeof deactivateSignatureTool === "function") {
      deactivateSignatureTool();
    }
  }

  // Home button
  document.getElementById("homeBtn").addEventListener("click", () => {
    sessionStorage.removeItem("pdfData");
    location.href = "index.html";
  });

  // Tool switching
  document.getElementById("selectTool").addEventListener("click", () => {
    console.log("Switching to select tool");
    currentTool = "select";
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("selectTool").classList.add("active");
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("moveTool").addEventListener("click", () => {
    console.log("Switching to move tool");
    currentTool = "move";
    deactivateAllTools();
    removeImageCursor();
    selectedText = null;
    selectedPageIndex = null;
    document.getElementById("moveTool").classList.add("active");
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("penTool").addEventListener("click", () => {
    console.log("Switching to pen tool");
    currentTool = "pen";
    deactivateAllTools();
    removeImageCursor();
    selectedText = null;
    selectedPageIndex = null;
    document.getElementById("penTool").classList.add("active");
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("textTool").addEventListener("click", () => {
    console.log("Switching to text tool");
    currentTool = "text";
    deactivateAllTools();
    removeImageCursor();
    selectedText = null;
    selectedPageIndex = null;
    document.getElementById("textTool").classList.add("active");
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("deleteTool").addEventListener("click", () => {
    console.log("Switching to delete tool");
    currentTool = "delete";
    deactivateAllTools();
    removeImageCursor();
    selectedText = null;
    selectedPageIndex = null;
    document.getElementById("deleteTool").classList.add("active");
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("eraserTool").addEventListener("click", () => {
    console.log("Switching to eraser tool");
    currentTool = "eraser";
    deactivateAllTools();
    removeImageCursor();
    selectedText = null;
    selectedPageIndex = null;
    document.getElementById("eraserTool").classList.add("active");
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("highlightTool").addEventListener("click", () => {
    console.log("Switching to highlight tool");
    currentTool = "highlight";
    deactivateAllTools();
    removeImageCursor();
    selectedText = null;
    selectedPageIndex = null;
    document.getElementById("highlightTool").classList.add("active");
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("imageTool").addEventListener("click", () => {
    console.log("Switching to image tool");
    currentTool = "image";
    deactivateAllTools();
    selectedText = null;
    selectedPageIndex = null;
    document.getElementById("imageTool").classList.add("active");

    // Add image cursor to all canvases
    pages.forEach((p) => {
      p.inkC.classList.add("image-cursor");
    });

    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  // Document switching
  document.getElementById("switchBtn").addEventListener("click", () => {
    document.getElementById("switchFile").click();
  });

  document
    .getElementById("switchFile")
    .addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      await loadFile(url);
    });

  // Pen settings
  document
    .getElementById("colorIn")
    .addEventListener("input", (e) => (strokeColor = e.target.value));

  document
    .getElementById("widthIn")
    .addEventListener(
      "input",
      (e) => (strokeWidth = parseInt(e.target.value, 10))
    );

  // Undo/Redo/Clear
  document.getElementById("undoBtn").addEventListener("click", () => {
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) => {
      if (undoStacks[i].length === 0) return;

      const stroke = undoStacks[i].pop();
      redoStacks[i].push(stroke);

      // Find and remove the stroke from strokeHistory
      const idx = strokeHistory[i].indexOf(stroke);
      if (idx > -1) {
        strokeHistory[i].splice(idx, 1);
      }

      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height);
    });
  });

  document.getElementById("redoBtn").addEventListener("click", () => {
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) => {
      if (redoStacks[i].length === 0) return;

      const stroke = redoStacks[i].pop();
      undoStacks[i].push(stroke);
      strokeHistory[i].push(stroke);

      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height);
    });
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("signatureSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");
    pages.forEach((p, i) => {
      const currentStrokes = [...strokeHistory[i]];
      if (currentStrokes.length > 0) {
        undoStacks[i].push({ type: "clear", strokes: currentStrokes });
        redoStacks[i].length = 0;
        strokeHistory[i].length = 0;
        p.ctx.clearRect(0, 0, p.inkC.width, p.inkC.height);
      }
    });
  });

  // Save PDF button
  document.getElementById("savePdfBtn").addEventListener("click", () => {
    console.log("Save PDF button clicked");
    savePDF();
  });

  // Shape tool - show popup on hover
  document.getElementById("shapeTool").addEventListener("mouseenter", (e) => {
    const shapePopup = document.getElementById("shapePopup");
    const shapeTool = document.getElementById("shapeTool");
    const rect = shapeTool.getBoundingClientRect();
    console.log("Shape tool hovered - rect:", rect);
    shapePopup.style.top = `${rect.top}px`;
    console.log("Popup top set to:", shapePopup.style.top);
    shapePopup.classList.remove("hidden");
    console.log("Popup classList:", shapePopup.classList.toString());
    console.log(
      "Computed display:",
      window.getComputedStyle(shapePopup).display
    );
    console.log(
      "Computed visibility:",
      window.getComputedStyle(shapePopup).visibility
    );
    console.log("Popup offsetWidth:", shapePopup.offsetWidth);
    console.log(
      "Popup getBoundingClientRect:",
      shapePopup.getBoundingClientRect()
    );
  });

  document.getElementById("shapeTool").addEventListener("mouseleave", (e) => {
    // Delay hiding to allow moving mouse to popup
    setTimeout(() => {
      const shapePopup = document.getElementById("shapePopup");
      if (
        !shapePopup.matches(":hover") &&
        !document.getElementById("shapeTool").matches(":hover")
      ) {
        shapePopup.classList.add("hidden");
      }
    }, 100);
  });

  // Keep popup visible when hovering over it
  document.getElementById("shapePopup").addEventListener("mouseenter", () => {
    document.getElementById("shapePopup").classList.remove("hidden");
  });

  document.getElementById("shapePopup").addEventListener("mouseleave", () => {
    document.getElementById("shapePopup").classList.add("hidden");
  });

  // Shape tool click handler - just activates the tool
  document.getElementById("shapeTool").addEventListener("click", (e) => {
    console.log("Switching to shape tool");
    currentTool = "shape";
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("shapeTool").classList.add("active");

    // Hide old inline selectors
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("signatureTool").addEventListener("click", () => {
    console.log("Switching to signature tool");
    currentTool = "signature";
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("signatureTool").classList.add("active");

    // Hide all selectors
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  // Stamp tool - show popup on hover
  document.getElementById("stampTool").addEventListener("mouseenter", (e) => {
    const stampPopup = document.getElementById("stampPopup");
    const stampTool = document.getElementById("stampTool");
    const rect = stampTool.getBoundingClientRect();
    stampPopup.style.top = `${rect.top}px`;
    stampPopup.classList.remove("hidden");
  });

  document.getElementById("stampTool").addEventListener("mouseleave", (e) => {
    // Delay hiding to allow moving mouse to popup
    setTimeout(() => {
      const stampPopup = document.getElementById("stampPopup");
      if (
        !stampPopup.matches(":hover") &&
        !document.getElementById("stampTool").matches(":hover")
      ) {
        stampPopup.classList.add("hidden");
      }
    }, 100);
  });

  // Keep popup visible when hovering over it
  document.getElementById("stampPopup").addEventListener("mouseenter", () => {
    document.getElementById("stampPopup").classList.remove("hidden");
  });

  document.getElementById("stampPopup").addEventListener("mouseleave", () => {
    document.getElementById("stampPopup").classList.add("hidden");
  });

  // Stamp tool click handler - just activates the tool
  document.getElementById("stampTool").addEventListener("click", (e) => {
    console.log("Switching to stamp tool");
    currentTool = "stamp";
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("stampTool").classList.add("active");

    // Hide old inline selectors
    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  // Shape type selectors
  document.getElementById("rectangleShape").addEventListener("click", () => {
    setShape("rectangle");
    document.getElementById("shapePopup").classList.add("hidden");
  });
  document.getElementById("circleShape").addEventListener("click", () => {
    setShape("circle");
    document.getElementById("shapePopup").classList.add("hidden");
  });
  document.getElementById("lineShape").addEventListener("click", () => {
    setShape("line");
    document.getElementById("shapePopup").classList.add("hidden");
  });
  document.getElementById("arrowShape").addEventListener("click", () => {
    setShape("arrow");
    document.getElementById("shapePopup").classList.add("hidden");
  });

  // Signature mode selectors
  document.getElementById("drawSignature").addEventListener("click", () => {
    setSignatureMode("draw");
  });
  document.getElementById("uploadSignature").addEventListener("click", () => {
    setSignatureMode("upload");
  });

  // Stamp selectors
  document.getElementById("stampApproved").addEventListener("click", () => {
    setStamp("approved");
    document.getElementById("stampPopup").classList.add("hidden");
  });
  document.getElementById("stampRejected").addEventListener("click", () => {
    setStamp("rejected");
    document.getElementById("stampPopup").classList.add("hidden");
  });
  document.getElementById("stampConfidential").addEventListener("click", () => {
    setStamp("confidential");
    document.getElementById("stampPopup").classList.add("hidden");
  });
  document.getElementById("stampDraft").addEventListener("click", () => {
    setStamp("draft");
    document.getElementById("stampPopup").classList.add("hidden");
  });
  document.getElementById("stampUrgent").addEventListener("click", () => {
    setStamp("urgent");
    document.getElementById("stampPopup").classList.add("hidden");
  });

  // Redaction tool - show popup on hover
  document.getElementById("redactionTool").addEventListener("mouseenter", (e) => {
    const redactionPopup = document.getElementById("redactionPopup");
    const redactionTool = document.getElementById("redactionTool");
    const rect = redactionTool.getBoundingClientRect();
    redactionPopup.style.top = `${rect.top}px`;
    redactionPopup.classList.remove("hidden");
  });

  document.getElementById("redactionTool").addEventListener("mouseleave", (e) => {
    setTimeout(() => {
      const redactionPopup = document.getElementById("redactionPopup");
      if (
        !redactionPopup.matches(":hover") &&
        !document.getElementById("redactionTool").matches(":hover")
      ) {
        redactionPopup.classList.add("hidden");
      }
    }, 100);
  });

  document.getElementById("redactionPopup").addEventListener("mouseenter", () => {
    document.getElementById("redactionPopup").classList.remove("hidden");
  });

  document.getElementById("redactionPopup").addEventListener("mouseleave", () => {
    document.getElementById("redactionPopup").classList.add("hidden");
  });

  // Redaction tool click handler
  document.getElementById("redactionTool").addEventListener("click", (e) => {
    currentTool = "redaction";
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("redactionTool").classList.add("active");

    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  // Redaction type selectors
  document.getElementById("redactionBlackBar").addEventListener("click", () => {
    setRedactionType("blackbar");
    document.getElementById("redactionPopup").classList.add("hidden");
  });
  document.getElementById("redactionWhiteOut").addEventListener("click", () => {
    setRedactionType("whiteout");
    document.getElementById("redactionPopup").classList.add("hidden");
  });

  // Checkbox tool click handler
  document.getElementById("checkboxTool").addEventListener("click", () => {
    currentTool = "checkbox";
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("checkboxTool").classList.add("active");

    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  // Date stamp tool click handler
  document.getElementById("dateStampTool").addEventListener("click", () => {
    currentTool = "datestamp";
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("dateStampTool").classList.add("active");

    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("textFieldTool").addEventListener("click", () => {
    currentTool = "textfield";
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("textFieldTool").classList.add("active");

    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("commentTool").addEventListener("click", () => {
    currentTool = "comment";
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("commentTool").classList.add("active");

    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("watermarkTool").addEventListener("click", () => {
    currentTool = "watermark";
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("watermarkTool").classList.add("active");

    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.add("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  // Measurement tool - show popup on hover
  document.getElementById("measurementTool").addEventListener("mouseenter", (e) => {
    const measurementPopup = document.getElementById("measurementPopup");
    const measurementTool = document.getElementById("measurementTool");
    const rect = measurementTool.getBoundingClientRect();
    measurementPopup.style.top = `${rect.top}px`;
    measurementPopup.classList.remove("hidden");
  });

  document.getElementById("measurementTool").addEventListener("mouseleave", (e) => {
    setTimeout(() => {
      const measurementPopup = document.getElementById("measurementPopup");
      if (
        !measurementPopup.matches(":hover") &&
        !document.getElementById("measurementTool").matches(":hover")
      ) {
        measurementPopup.classList.add("hidden");
      }
    }, 100);
  });

  document.getElementById("measurementPopup").addEventListener("mouseenter", () => {
    document.getElementById("measurementPopup").classList.remove("hidden");
  });

  document.getElementById("measurementPopup").addEventListener("mouseleave", () => {
    document.getElementById("measurementPopup").classList.add("hidden");
  });

  // Measurement tool click handler - set to distance mode by default
  document.getElementById("measurementTool").addEventListener("click", () => {
    currentTool = "measurement";
    setMeasurementMode("distance");
    deactivateAllTools();
    removeImageCursor();
    document.getElementById("measurementTool").classList.add("active");

    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.remove("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  // Measurement type selectors
  document.getElementById("measurementDistance").addEventListener("click", () => {
    currentTool = "measurement";
    setMeasurementMode("distance");
    document.getElementById("measurementPopup").classList.add("hidden");
    document.getElementById("measurementTool").classList.add("active");
    document.getElementById("selectTool").classList.remove("active");
    document.getElementById("moveTool").classList.remove("active");
    document.getElementById("penTool").classList.remove("active");
    document.getElementById("textTool").classList.remove("active");
    document.getElementById("deleteTool").classList.remove("active");
    document.getElementById("eraserTool").classList.remove("active");
    document.getElementById("highlightTool").classList.remove("active");
    document.getElementById("imageTool").classList.remove("active");
    document.getElementById("shapeTool").classList.remove("active");
    document.getElementById("signatureTool").classList.remove("active");
    document.getElementById("stampTool").classList.remove("active");
    document.getElementById("redactionTool").classList.remove("active");
    document.getElementById("checkboxTool").classList.remove("active");
    document.getElementById("dateStampTool").classList.remove("active");
    document.getElementById("textFieldTool").classList.remove("active");
    document.getElementById("commentTool").classList.remove("active");
    document.getElementById("watermarkTool").classList.remove("active");

    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.remove("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  document.getElementById("measurementArea").addEventListener("click", () => {
    currentTool = "measurement";
    setMeasurementMode("area");
    document.getElementById("measurementPopup").classList.add("hidden");
    document.getElementById("measurementTool").classList.add("active");
    document.getElementById("selectTool").classList.remove("active");
    document.getElementById("moveTool").classList.remove("active");
    document.getElementById("penTool").classList.remove("active");
    document.getElementById("textTool").classList.remove("active");
    document.getElementById("deleteTool").classList.remove("active");
    document.getElementById("eraserTool").classList.remove("active");
    document.getElementById("highlightTool").classList.remove("active");
    document.getElementById("imageTool").classList.remove("active");
    document.getElementById("shapeTool").classList.remove("active");
    document.getElementById("signatureTool").classList.remove("active");
    document.getElementById("stampTool").classList.remove("active");
    document.getElementById("redactionTool").classList.remove("active");
    document.getElementById("checkboxTool").classList.remove("active");
    document.getElementById("dateStampTool").classList.remove("active");
    document.getElementById("textFieldTool").classList.remove("active");
    document.getElementById("commentTool").classList.remove("active");
    document.getElementById("watermarkTool").classList.remove("active");

    document.getElementById("shapeSelector").classList.add("hidden");
    document.getElementById("stampSelector").classList.add("hidden");
    document.getElementById("measurementUnitSelector").classList.remove("hidden");

    pages.forEach((p, i) =>
      redrawStrokes(p.ctx, i, p.inkC.width, p.inkC.height)
    );
  });

  // Measurement unit selectors
  document.getElementById("unitPx").addEventListener("click", () => {
    setMeasurementUnit("px");
    document.getElementById("unitPx").classList.add("active");
    document.getElementById("unitIn").classList.remove("active");
    document.getElementById("unitFt").classList.remove("active");
    document.getElementById("unitCm").classList.remove("active");
    document.getElementById("unitMm").classList.remove("active");
  });

  document.getElementById("unitIn").addEventListener("click", () => {
    setMeasurementUnit("in");
    document.getElementById("unitPx").classList.remove("active");
    document.getElementById("unitIn").classList.add("active");
    document.getElementById("unitFt").classList.remove("active");
    document.getElementById("unitCm").classList.remove("active");
    document.getElementById("unitMm").classList.remove("active");
  });

  document.getElementById("unitFt").addEventListener("click", () => {
    setMeasurementUnit("ft");
    document.getElementById("unitPx").classList.remove("active");
    document.getElementById("unitIn").classList.remove("active");
    document.getElementById("unitFt").classList.add("active");
    document.getElementById("unitCm").classList.remove("active");
    document.getElementById("unitMm").classList.remove("active");
  });

  document.getElementById("unitCm").addEventListener("click", () => {
    setMeasurementUnit("cm");
    document.getElementById("unitPx").classList.remove("active");
    document.getElementById("unitIn").classList.remove("active");
    document.getElementById("unitFt").classList.remove("active");
    document.getElementById("unitCm").classList.add("active");
    document.getElementById("unitMm").classList.remove("active");
  });

  document.getElementById("unitMm").addEventListener("click", () => {
    setMeasurementUnit("mm");
    document.getElementById("unitPx").classList.remove("active");
    document.getElementById("unitIn").classList.remove("active");
    document.getElementById("unitFt").classList.remove("active");
    document.getElementById("unitCm").classList.remove("active");
    document.getElementById("unitMm").classList.add("active");
  });

  // Page sidebar toggle
  document.getElementById("togglePageSidebar").addEventListener("click", () => {
    togglePageSidebar();
  });
}
