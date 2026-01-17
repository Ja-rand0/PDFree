// CommentTool.js - Sticky notes and comments
// Future Feature - NOT YET IMPLEMENTED

/*
 * PLANNED FEATURES:
 *
 * 1. Sticky Notes
 *    - Click to place a sticky note icon
 *    - Click icon to expand/edit note content
 *    - Collapsible view
 *    - Multiple colors
 *
 * 2. Text Comments
 *    - Inline comments attached to text selections
 *    - Comment thread support
 *
 * 3. Comment Panel
 *    - Sidebar showing all comments
 *    - Filter by author, date, status
 *    - Navigate to comment location
 *
 * STROKE FORMAT:
 * {
 *   type: "comment",
 *   commentType: "sticky" | "text",
 *   x: normalized x position,
 *   y: normalized y position,
 *   content: string,
 *   author: string,
 *   timestamp: ISO date string,
 *   color: color string,
 *   expanded: boolean,
 *   resolved: boolean
 * }
 */

const commentColors = {
  yellow: "#FFEB3B",
  blue: "#2196F3",
  green: "#4CAF50",
  pink: "#E91E63",
  orange: "#FF9800",
};

let currentCommentColor = "yellow";

function setCommentColor(color) {
  if (commentColors[color]) {
    currentCommentColor = color;
  }
}

// ========== STICKY NOTES ==========

function handleStickyNoteClick(e, canvas, pageIndex) {
  // TODO: Implement
  console.log("Sticky note tool not yet implemented");
}

function renderStickyNote(ctx, stroke, canvasWidth, canvasHeight) {
  const x = stroke.x * canvasWidth;
  const y = stroke.y * canvasHeight;
  const iconSize = 24;

  // Draw icon
  ctx.fillStyle = commentColors[stroke.color] || commentColors.yellow;
  ctx.fillRect(x, y, iconSize, iconSize);

  // Draw fold
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.moveTo(x + iconSize - 6, y);
  ctx.lineTo(x + iconSize, y + 6);
  ctx.lineTo(x + iconSize, y);
  ctx.closePath();
  ctx.fill();

  // Draw expanded content if open
  if (stroke.expanded && stroke.content) {
    const padding = 8;
    const maxWidth = 200;
    const lineHeight = 16;

    ctx.font = "12px Arial";
    ctx.fillStyle = commentColors[stroke.color] || commentColors.yellow;
    ctx.fillRect(x, y + iconSize + 4, maxWidth, 100);

    ctx.fillStyle = "#000000";
    ctx.fillText(stroke.content, x + padding, y + iconSize + 4 + padding + 12);
  }
}

// ========== COMMENT PANEL ==========

function renderCommentPanel() {
  // TODO: Implement sidebar panel
  console.log("Comment panel not yet implemented");
}

function getAllComments() {
  const comments = [];
  strokeHistory.forEach((pageStrokes, pageIndex) => {
    pageStrokes.forEach((stroke) => {
      if (stroke.type === "comment") {
        comments.push({ ...stroke, pageIndex });
      }
    });
  });
  return comments;
}

function filterComments(comments, filters) {
  return comments.filter((comment) => {
    if (
      filters.resolved !== undefined &&
      comment.resolved !== filters.resolved
    ) {
      return false;
    }
    if (filters.author && comment.author !== filters.author) {
      return false;
    }
    if (filters.color && comment.color !== filters.color) {
      return false;
    }
    return true;
  });
}

function resolveComment(pageIndex, commentIndex) {
  const strokes = strokeHistory[pageIndex];
  if (
    strokes &&
    strokes[commentIndex] &&
    strokes[commentIndex].type === "comment"
  ) {
    strokes[commentIndex].resolved = true;
    return true;
  }
  return false;
}
