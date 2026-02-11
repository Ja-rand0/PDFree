// Zoom control functionality

function applyZoom() {
  document.getElementById("zoomTxt").textContent = Math.round(zoom * 100) + "%";
  renderPages();
}

function initZoomTool() {
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const zoomInBtn = document.getElementById("zoomInBtn");

  if (!zoomOutBtn || !zoomInBtn) {
    console.error("Zoom buttons not found in DOM!");
    return;
  }

  zoomOutBtn.addEventListener("click", function () {

    let newZoom = zoom - 0.1;
    if (newZoom < minZoom) newZoom = minZoom;

    if (isRendering) {
      pendingZoom = newZoom;
      document.getElementById("zoomTxt").textContent =
        Math.round(newZoom * 100) + "%";
    } else {
      zoom = newZoom;
      applyZoom();
    }
  });

  zoomInBtn.addEventListener("click", function () {

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
    } else {
      zoom = newZoom;
      applyZoom();
    }
  });

}
