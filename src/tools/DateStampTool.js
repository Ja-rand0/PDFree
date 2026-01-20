// DateStampTool.js - Click to insert current date

let dateFormat = "MM/DD/YYYY";

function setDateFormat(format) {
  dateFormat = format;
}

function handleDateStampClick(e, canvas, pageIndex) {
  const p = getCanvasPosition(e, canvas);

  const dateStamp = {
    type: "datestamp",
    x: p.x / canvas.width,
    y: p.y / canvas.height,
    date: new Date().toISOString(),
    format: dateFormat,
    color: strokeColor,
    fontSize: 0.02,
  };

  strokeHistory[pageIndex].push(dateStamp);
  undoStacks[pageIndex].push(dateStamp);
  redoStacks[pageIndex].length = 0;

  redrawStrokes(
    canvas.getContext("2d"),
    pageIndex,
    canvas.width,
    canvas.height
  );
}

function formatDate(date, format) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();

  return format
    .replace("MM", month)
    .replace("DD", day)
    .replace("YYYY", year)
    .replace("YY", String(year).slice(-2));
}
