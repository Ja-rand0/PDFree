// Image tool functionality - upload and place images on PDF

let pendingImage = null;

function handleImageClick(e, canvas, pageIndex) {
  // Create a hidden file input
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.style.display = "none";

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Read the image file
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Get click position
        const p = getCanvasPosition(e, canvas);

        // Scale image to reasonable size (max 200px wide/tall)
        const maxSize = 200;
        let imgWidth = img.width;
        let imgHeight = img.height;

        if (imgWidth > maxSize || imgHeight > maxSize) {
          const ratio = Math.min(maxSize / imgWidth, maxSize / imgHeight);
          imgWidth = imgWidth * ratio;
          imgHeight = imgHeight * ratio;
        }

        // Center the image on cursor position
        const centerX = p.x - imgWidth / 2;
        const centerY = p.y - imgHeight / 2;

        // Calculate normalized position and size
        const normalizedX = centerX / canvas.width;
        const normalizedY = centerY / canvas.height;
        const normalizedWidth = imgWidth / canvas.width;
        const normalizedHeight = imgHeight / canvas.height;

        // Create image stroke with pre-loaded image object
        const imageStroke = {
          type: "image",
          x: normalizedX,
          y: normalizedY,
          width: normalizedWidth,
          height: normalizedHeight,
          dataUrl: readerEvent.target.result,
          imgObject: img, // Store the loaded image object
        };

        strokeHistory[pageIndex].push(imageStroke);
        undoStacks[pageIndex].push(imageStroke);
        redoStacks[pageIndex].length = 0;

        // Redraw to show the image
        redrawStrokes(
          canvas.getContext("2d"),
          pageIndex,
          canvas.width,
          canvas.height
        );

      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.body.appendChild(input);
  input.click();
  input.remove();
}
