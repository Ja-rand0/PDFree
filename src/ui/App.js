// Main initialization

window.addEventListener("DOMContentLoaded", async () => {
  const base64Data = sessionStorage.getItem("pdfData");
  if (!base64Data) {
    location.href = "index.html";
    return;
  }

  document.getElementById("toolBar").classList.remove("hidden");
  document.getElementById("pdfArea").classList.remove("hidden");
  document.getElementById("sidebar").classList.remove("hidden");

  // Convert base64 back to ArrayBuffer
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  pdfBytes = bytes.buffer;
  zoom = 1;

  // Initialize all controls
  initToolbar();
  initZoomTool();

  // Render the PDF
  await renderPages();
});
