// CommentTool.js - Sticky note comments

let currentCommentColor = "#FFEB3B"; // Yellow

function setCommentColor(color) {
  currentCommentColor = color;
}

function handleCommentClick(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);

  // Check if clicking existing comment to edit
  const strokes = strokeHistory[pageIndex];
  if (strokes) {
    for (let i = strokes.length - 1; i >= 0; i--) {
      const stroke = strokes[i];
      if (stroke.type === "comment") {
        const commentX = stroke.x * canvas.width;
        const commentY = stroke.y * canvas.height;
        const iconSize = 30;

        if (
          p.x >= commentX &&
          p.x <= commentX + iconSize &&
          p.y >= commentY &&
          p.y <= commentY + iconSize
        ) {
          // Edit existing comment
          const newContent = prompt("Edit comment:", stroke.content);
          if (newContent !== null && newContent.trim() !== "") {
            stroke.content = newContent;
            redrawStrokes(
              canvas.getContext("2d"),
              pageIndex,
              canvas.width,
              canvas.height
            );
          }
          return;
        }
      }
    }
  }

  // Create new comment
  const content = prompt("Enter comment:");
  if (content !== null && content.trim() !== "") {
    const comment = {
      type: "comment",
      x: p.x / canvas.width,
      y: p.y / canvas.height,
      content: content,
      color: currentCommentColor,
      timestamp: new Date().toISOString(),
    };

    strokeHistory[pageIndex].push(comment);
    undoStacks[pageIndex].push(comment);
    redoStacks[pageIndex].length = 0;

    redrawStrokes(
      canvas.getContext("2d"),
      pageIndex,
      canvas.width,
      canvas.height
    );
  }
}
