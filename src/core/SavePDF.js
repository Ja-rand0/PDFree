// Save PDF functionality - burns all annotations into the PDF

async function savePDF() {
  if (!pdfBytes) {
    alert("No PDF loaded!");
    return;
  }


  try {
    // Load the original PDF with pdf-lib
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const pdfPages = pdfDoc.getPages();

    // For each page, render annotations to a canvas and embed as image
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pdfPages[pageIndex];
      const { width, height } = page.getSize();

      // Create an offscreen canvas for this page
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // Draw all annotations for this page
      redrawStrokes(ctx, pageIndex, width, height);

      // Convert canvas to PNG and embed in PDF
      const pngDataUrl = canvas.toDataURL("image/png");
      const pngImageBytes = await fetch(pngDataUrl).then((res) =>
        res.arrayBuffer()
      );

      const pngImage = await pdfDoc.embedPng(pngImageBytes);

      // Draw the annotation layer on top of the page
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }

    // Save the modified PDF
    const pdfBytesModified = await pdfDoc.save();

    // Create download link
    const blob = new Blob([pdfBytesModified], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "annotated-document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error saving PDF:", error);
    alert("Error saving PDF: " + error.message);
  }
}
