# PDFree - Free PDF Editor

A fully client-side PDF editor that runs entirely in your browser. No accounts, no server uploads, no tracking. Your documents never leave your device.

## Features

**20+ annotation and editing tools:**

- **Drawing:** Freehand pen, highlighter (5 colors), shapes (rectangle, circle, line, arrow)
- **Text:** Text annotations, text fields, date stamps, comments/sticky notes
- **Media:** Image insert, signature (draw or upload), stamps (Approved, Rejected, Confidential, etc.), watermarks
- **Forms:** Checkboxes, fillable text fields
- **Redaction:** Black bar and white-out redaction
- **Measurement:** Distance and area measurement with multiple units (px, in, ft, cm, mm)
- **Selection:** Single select with 8-point resize handles, multi-select with unified move/resize
- **Page Management:** Drag-and-drop page reordering, thumbnail sidebar navigation
- **Utilities:** Undo/redo, zoom (25%-200%), save PDF with annotations baked in

## Usage

1. Open `index.html` in your browser (or host it on any static server)
2. Upload a PDF
3. Use the toolbar to annotate, fill forms, add signatures, etc.
4. Click **Save PDF** to download your edited document

No build step required. No dependencies to install.

## Tech Stack

- **Vanilla JavaScript** (ES6+) - No frameworks
- **[PDF.js](https://mozilla.github.io/pdf.js/)** - PDF rendering
- **[pdf-lib](https://pdf-lib.js.org/)** - PDF modification and saving

## Hosting

PDFree is a static site. Host it anywhere:
- GitHub Pages
- Netlify
- Vercel
- Any web server

Just serve the root directory as-is.

## License

[Proprietary](LICENSE) - Source visible for transparency. Not open for redistribution.
