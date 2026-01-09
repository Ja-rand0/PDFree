// Zoom control functionality

function applyZoom() {
  console.log("applyZoom called with zoom:", zoom);
  document.getElementById("zoomTxt").textContent = Math.round(zoom * 100) + "%";
  renderPages();
}

function initZoomTool() {
  console.log("initZoomTool called");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const zoomInBtn = document.getElementById("zoomInBtn");
  console.log("Zoom buttons found:", zoomOutBtn, zoomInBtn);

  if (!zoomOutBtn || !zoomInBtn) {
    console.error("Zoom buttons not found in DOM!");
    return;
  }

  zoomOutBtn.addEventListener("click", function () {
    console.log("Zoom out clicked, current zoom:", zoom);

    let newZoom = zoom - 0.1;
    if (newZoom < minZoom) newZoom = minZoom;

    if (isRendering) {
      pendingZoom = newZoom;
      document.getElementById("zoomTxt").textContent =
        Math.round(newZoom * 100) + "%";
      console.log("Queued zoom:", newZoom);
    } else {
      zoom = newZoom;
      applyZoom();
    }
  });

  zoomInBtn.addEventListener("click", function () {
    console.log("Zoom in clicked, current zoom:", zoom);

    let newZoom;
    if (zoom === 0.25) {
      newZoom = 0.3;
    } else {
      newZoom = zoom + 0.1;
    }

    if (newZoom > maxZoom) newZoom = maxZoom;

    if (isRendering) {
      pendingZoom = newZoom;
      document.getElementById("zoomTxt").textContent =
        Math.round(newZoom * 100) + "%";
      console.log("Queued zoom:", newZoom);
    } else {
      zoom = newZoom;
      applyZoom();
    }
  });

  console.log("Zoom controls initialized successfully");
}
