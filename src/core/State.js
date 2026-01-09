// Global state variables
let pdfBytes,
  pages = [],
  strokeColor = "#ff0000",
  strokeWidth = 2,
  zoom = 1,
  minZoom = 0.25,
  maxZoom = 2,
  isRendering = false,
  pendingZoom = null,
  currentTool = "pen",
  selectedText = null,
  selectedImage = null,
  selectedPageIndex = null;

// Store strokes as vector data
const strokeHistory = [];
const undoStacks = [];
const redoStacks = [];
