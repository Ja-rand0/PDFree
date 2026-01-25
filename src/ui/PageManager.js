// Page Manager - Thumbnail sidebar and page navigation

let currentSelectedPage = 0;
let draggedPageIndex = null;
let draggedElement = null;

/**
 * Initialize page thumbnails sidebar
 */
function initPageThumbnails() {
  const container = document.getElementById("pageThumbnails");
  container.innerHTML = "";

  pages.forEach((page, index) => {
    const thumbnailDiv = document.createElement("div");
    thumbnailDiv.className = "page-thumbnail";
    thumbnailDiv.dataset.pageIndex = index;
    if (index === 0) thumbnailDiv.classList.add("selected");

    // Create thumbnail canvas
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.className = "page-thumbnail-canvas";

    // Scale down for thumbnail (max width 176px with padding) - 10% larger
    const scale = 176 / page.pdfC.width;
    thumbCanvas.width = page.pdfC.width * scale;
    thumbCanvas.height = page.pdfC.height * scale;

    const thumbCtx = thumbCanvas.getContext("2d");

    // Draw PDF page
    thumbCtx.drawImage(page.pdfC, 0, 0, thumbCanvas.width, thumbCanvas.height);

    // Draw annotations on top
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = page.inkC.width;
    tempCanvas.height = page.inkC.height;
    const tempCtx = tempCanvas.getContext("2d");
    redrawStrokes(tempCtx, index, page.inkC.width, page.inkC.height);
    thumbCtx.drawImage(tempCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);

    // Page label
    const label = document.createElement("div");
    label.className = "page-thumbnail-label";
    label.textContent = `${index + 1}`;

    thumbnailDiv.appendChild(thumbCanvas);
    thumbnailDiv.appendChild(label);
    container.appendChild(thumbnailDiv);

    // Make draggable
    thumbnailDiv.draggable = true;

    // Drag start
    thumbnailDiv.addEventListener("dragstart", (e) => {
      draggedPageIndex = index;
      draggedElement = thumbnailDiv;
      thumbnailDiv.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    // Drag end
    thumbnailDiv.addEventListener("dragend", () => {
      thumbnailDiv.classList.remove("dragging");
      draggedPageIndex = null;
      draggedElement = null;
      // Remove all drag-over indicators
      document.querySelectorAll(".page-thumbnail").forEach((thumb) => {
        thumb.classList.remove("drag-over-top", "drag-over-bottom");
      });
    });

    // Drag over
    thumbnailDiv.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (draggedPageIndex === null || draggedPageIndex === index) return;

      const rect = thumbnailDiv.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const isTop = e.clientY < midpoint;

      // Remove all indicators first
      document.querySelectorAll(".page-thumbnail").forEach((thumb) => {
        thumb.classList.remove("drag-over-top", "drag-over-bottom");
      });

      // Add indicator
      if (isTop) {
        thumbnailDiv.classList.add("drag-over-top");
      } else {
        thumbnailDiv.classList.add("drag-over-bottom");
      }
    });

    // Drop
    thumbnailDiv.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedPageIndex === null || draggedPageIndex === index) return;

      const rect = thumbnailDiv.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const isTop = e.clientY < midpoint;

      let newIndex = isTop ? index : index + 1;
      if (draggedPageIndex < index && !isTop) {
        newIndex--;
      }

      reorderPage(draggedPageIndex, newIndex);
    });

    // Click handler - navigate to page
    thumbnailDiv.addEventListener("click", (e) => {
      // Don't navigate if we just finished dragging
      if (e.defaultPrevented) return;
      navigateToPage(index);
    });

    // Double-click handler - navigate to page
    thumbnailDiv.addEventListener("dblclick", (e) => {
      e.preventDefault();
      navigateToPage(index);
    });
  });
}

/**
 * Navigate to a specific page
 */
function navigateToPage(pageIndex) {
  if (pageIndex < 0 || pageIndex >= pages.length) return;

  // Update selection in sidebar
  document.querySelectorAll(".page-thumbnail").forEach((thumb, idx) => {
    if (idx === pageIndex) {
      thumb.classList.add("selected");
    } else {
      thumb.classList.remove("selected");
    }
  });

  // Scroll to the page in main view
  const pageElement = pages[pageIndex].inkC.parentElement;
  if (pageElement) {
    pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  currentSelectedPage = pageIndex;
}

/**
 * Update a specific thumbnail (called after changes)
 */
function updateThumbnail(pageIndex) {
  const thumbnailDiv = document.querySelector(
    `.page-thumbnail[data-page-index="${pageIndex}"]`
  );
  if (!thumbnailDiv) return;

  const thumbCanvas = thumbnailDiv.querySelector(".page-thumbnail-canvas");
  const thumbCtx = thumbCanvas.getContext("2d");

  const page = pages[pageIndex];

  // Clear and redraw
  thumbCtx.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);

  // Draw PDF page - 10% larger
  const scale = 176 / page.pdfC.width;
  thumbCtx.drawImage(page.pdfC, 0, 0, thumbCanvas.width, thumbCanvas.height);

  // Draw annotations
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = page.inkC.width;
  tempCanvas.height = page.inkC.height;
  const tempCtx = tempCanvas.getContext("2d");
  redrawStrokes(tempCtx, pageIndex, page.inkC.width, page.inkC.height);
  thumbCtx.drawImage(tempCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
}

/**
 * Show page sidebar
 */
function showPageSidebar() {
  document.getElementById("pageSidebar").classList.remove("hidden");
  initPageThumbnails();
}

/**
 * Hide page sidebar
 */
function hidePageSidebar() {
  document.getElementById("pageSidebar").classList.add("hidden");
  // Adjust PDF area margin
  const pdfArea = document.getElementById("pdfArea");
  pdfArea.style.marginRight = "0";
  pdfArea.style.width = "calc(100% - 60px)";
}

/**
 * Show page sidebar
 */
function showPageSidebarWithWidth() {
  const pdfArea = document.getElementById("pdfArea");
  pdfArea.style.marginRight = "220px";
  pdfArea.style.width = "calc(100% - 280px)";
}

/**
 * Toggle page sidebar visibility
 */
function togglePageSidebar() {
  const sidebar = document.getElementById("pageSidebar");
  const pdfArea = document.getElementById("pdfArea");
  const isHidden = sidebar.classList.contains("hidden");

  if (isHidden) {
    sidebar.classList.remove("hidden");
    pdfArea.style.marginRight = "220px";
    pdfArea.style.width = "calc(100% - 280px)";
    // Refresh thumbnails when showing
    initPageThumbnails();
  } else {
    sidebar.classList.add("hidden");
    pdfArea.style.marginRight = "0";
    pdfArea.style.width = "calc(100% - 60px)";
  }
}

/**
 * Reorder a page from one index to another
 */
function reorderPage(fromIndex, toIndex) {
  if (fromIndex === toIndex || toIndex < 0 || toIndex > pages.length) return;

  console.log(`Reordering page from ${fromIndex} to ${toIndex}`);

  // Reorder pages array
  const movedPage = pages.splice(fromIndex, 1)[0];
  const actualToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
  pages.splice(actualToIndex, 0, movedPage);

  // Reorder stroke history
  const movedStrokes = strokeHistory.splice(fromIndex, 1)[0];
  strokeHistory.splice(actualToIndex, 0, movedStrokes);

  // Reorder undo stacks
  const movedUndo = undoStacks.splice(fromIndex, 1)[0];
  undoStacks.splice(actualToIndex, 0, movedUndo);

  // Reorder redo stacks
  const movedRedo = redoStacks.splice(fromIndex, 1)[0];
  redoStacks.splice(actualToIndex, 0, movedRedo);

  // Reorder DOM elements in canvasWrap
  const wrap = document.getElementById("canvasWrap");
  const pageElements = Array.from(wrap.children);
  const movedElement = pageElements[fromIndex];

  // Remove the element first
  wrap.removeChild(movedElement);

  // Get fresh reference to children after removal
  const currentElements = Array.from(wrap.children);

  // Insert at the correct position
  if (actualToIndex >= currentElements.length) {
    wrap.appendChild(movedElement);
  } else {
    wrap.insertBefore(movedElement, currentElements[actualToIndex]);
  }

  // CRITICAL: Reattach event listeners with correct indices after reorder
  // The DOM elements have been reordered, but event listeners still reference old indices
  // We need to remove old listeners and attach new ones with updated indices
  const wrap2 = document.getElementById("canvasWrap");
  const pageContainers = Array.from(wrap2.children);

  pageContainers.forEach((container, newIndex) => {
    const inkC = container.querySelector(".inkCanvasTouch");
    if (inkC) {
      // Clone to remove all old event listeners
      const newInkC = inkC.cloneNode(true);

      // Copy canvas content
      const newCtx = newInkC.getContext("2d");
      newCtx.drawImage(inkC, 0, 0);

      // Replace in DOM
      inkC.parentNode.replaceChild(newInkC, inkC);

      // Update page reference
      pages[newIndex].inkC = newInkC;
      pages[newIndex].ctx = newCtx;

      // Attach listeners with correct index
      attachCanvasListeners(newInkC, newIndex);
    }
  });

  // Refresh thumbnails to show new order
  initPageThumbnails();

  // Update selected page if needed
  if (currentSelectedPage === fromIndex) {
    currentSelectedPage = actualToIndex;
  } else if (fromIndex < currentSelectedPage && actualToIndex >= currentSelectedPage) {
    currentSelectedPage--;
  } else if (fromIndex > currentSelectedPage && actualToIndex <= currentSelectedPage) {
    currentSelectedPage++;
  }
}
