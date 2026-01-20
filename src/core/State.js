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
  selectedShape = null,
  selectedStamp = null,
  selectedSignature = null,
  selectedStroke = null,
  selectedObjects = [], // Array for multi-select
  selectedPageIndex = null,
  hoveredComment = null, // Track hovered comment for popup display
  lastMousePos = { x: 0, y: 0 }; // Track mouse position for hover detection

// Store strokes as vector data
const strokeHistory = [];
const undoStacks = [];
const redoStacks = [];
