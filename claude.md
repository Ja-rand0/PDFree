# Claude Development Notes

## Important Reminders

- **Make sure tool that I'm currently working on WORKS with all other tools.**
- **NO output until all bugs are tested against the Tool Compatibility Matrix below**

## Token Usage Optimization

- **NO TodoWrite** - Skip task tracking, just work
- **Read with offset/limit** - Only read needed file sections
- **Be concise** - Skip explanations, just code
- **User should be direct** - Specific tasks, not exploration

---

## Tool Compatibility Matrix

**Before marking any tool as complete, verify it works with ALL core functions:**

| Object Type      | Select | Move | Delete | Erase | Resize | Multiselect Move | Multiselect Resize | Undo |
|------------------|--------|------|--------|-------|--------|------------------|-------------------|------|
| text             | ✅     | ✅   | ✅     | ✅    | ⚠️ WIP | ✅               | ✅                | ✅   |
| image            | ✅     | ✅   | ✅     | ✅    | ✅     | ✅               | ✅                | ✅   |
| signature-image  | ✅     | ✅   | ?      | ✅    | ✅     | ✅               | ✅                | ✅   |
| shape            | ✅     | ✅   | ✅     | ✅    | ✅     | ✅               | ✅                | ✅   |
| pen stroke       | ✅     | ✅   | ✅     | ✅    | ✅     | ✅               | ✅                | ✅   |
| highlight        | ✅     | ✅   | ✅     | ✅    | ✅     | ✅               | ✅                | ✅   |
| stamp            | ✅     | ✅   | ✅     | ✅    | ✅     | ✅               | ✅                | ✅   |
| checkbox         | ✅     | ✅   | ✅     | ✅    | ✅     | ✅               | ✅                | ✅   |
| datestamp        | ✅     | ✅   | ✅     | ✅    | ✅     | ✅               | ✅                | ✅   |
| textfield        | ✅     | ✅   | ✅     | ✅    | ✅     | ✅               | ✅                | ✅   |
| comment          | ✅     | ✅   | ✅     | ✅    | ?      | ✅               | ✅                | ✅   |
| watermark        | ✅     | ✅   | ✅     | ✅    | ?      | ✅               | ✅                | ✅   |
| redaction        | ✅     | ✅   | ✅     | ✅    | ✅     | ✅               | ✅                | ✅   |
| measurement      | ✅     | ✅   | ✅     | ✅    | ?      | ✅               | ✅                | ✅   |

**Legend:** ✅ = Working | ⚠️ = Partial/WIP | ? = Needs Testing | ❌ = Not Implemented

---

## Session Bug Fixes (Latest)

### Fixed This Session:
1. **Signature Tool** - Now creates single `signature-image` object (not multiple strokes)
2. **Signature Tool** - MoveTool now handles `signature-image`
3. **Signature Tool** - EraserTool now handles `signature-image`
4. **Redaction Tool** - Move, Delete, Erase all working
5. **Redaction Tool** - Single-object resize handles now work
6. **Selection Tool** - Single objects in `selectedObjects` array now have resize handle detection
7. **Multiselect** - measurement, redaction, comment, watermark now included in move/resize
8. **Text Tool** - Left edge aligns with cursor (removed -100px offset)
9. **Text Tool** - Resize now keeps position fixed, only fontSize changes
10. **Highlight Tool** - Renders on stop drawing
11. **Circle/Ellipse** - Fixed scaling to work in pixels for uniform scaling

### Remaining Bugs to Verify:
1. **Text Tool resize** - User reports position still moving (needs re-test)
2. **Checkbox snap-to-grid** - Not implemented
3. **Measurement text zoom scaling** - Not implemented

---

## Architecture Notes

### Object Types and Their Properties:
- **text**: `{type, text, x, y, color, fontSize, width}`
- **image**: `{type, dataUrl, x, y, width, height}`
- **signature-image**: `{type, dataUrl, x, y, width, height, originalWidth, originalHeight}`
- **shape**: `{type, shapeType, startX, startY, endX, endY, color, width, radiusX?, radiusY?}`
- **checkbox**: `{type, x, y, size, checked}`
- **datestamp**: `{type, x, y, fontSize, date, format, color}`
- **textfield**: `{type, x, y, width, height, fontSize, text, color}`
- **redaction**: `{type, redactionType, x, y, width, height}`
- **measurement**: `{type, measureType, startX, startY, endX, endY}` or `{type, measureType, points}`
- **comment**: `{type, x, y, text, color}`
- **watermark**: `{type, x, y, text, fontSize, color, rotation}`

### Selection System:
- Legacy objects (text, image, shape, stamp, signature, pen stroke) use dedicated `selected*` variables
- Newer objects (checkbox, datestamp, textfield, comment, watermark, measurement, redaction) use `selectedObjects` array
- When `selectedObjects.length === 1`, single-object resize handles are enabled
- When `selectedObjects.length > 1`, unified bounding box handles are used

### Key Files:
- `src/tools/SelectTool.js` - All selection, resize, multiselect logic
- `src/tools/MoveTool.js` - Move functionality for all object types
- `src/tools/DeleteTool.js` - Delete functionality
- `src/tools/EraserTool.js` - Erase on contact functionality
- `src/core/HitDetection.js` - Click detection for all object types
- `src/core/PDFLoader.js` - Rendering and bounds calculation

### HitDetection Functions:
Each object type needs a `check*Click` function in HitDetection.js:
- `checkTextClick`, `checkImageClick`, `checkShapeClick`, `checkStampClick`
- `checkSignatureClick`, `checkPenStrokeClick`, `checkCheckboxClick`
- `checkDateStampClick`, `checkTextFieldClick`, `checkCommentClick`
- `checkWatermarkClick`, `checkMeasurementClick`, `checkRedactionClick`

---

## Project Status

### Phase 1: Core Drawing Tools ✅
- Pen Tool (freehand drawing)
- Shape Tool (rectangle, circle, line, arrow)
- Text Tool
- Highlighter Tool
- Eraser Tool

### Phase 2: Media & Stamp Tools ✅
- Image Tool (insert images)
- Signature Tool (draw or upload signature)
- Stamp Tool (predefined stamps)

### Phase 3: Form & Annotation Tools ✅
- Checkbox Tool
- Date Stamp Tool
- Text Field Tool
- Comment Tool
- Watermark Tool
- Redaction Tool (black bar, white out)
- Measurement Tool (distance, area)

### Phase 4: Core Functions ✅
- Selection Tool (single object)
- Multi-select Tool (shift+click or drag box)
- Move Tool
- Delete Tool
- Resize (single and multi-select)
- Undo/Redo

### Phase 5: Bug Fixes & Polish 🚧 (Current)
- Tool compatibility verification (see matrix above)
- Text resize position fix (WIP)
- Testing all tools together

---

## 📋 Full Feature Checklist & Vision

### 🔧 TOOLBAR TOOLS (Interactive Tools)

#### Drawing & Annotation
| Tool | Status | Notes |
|------|--------|-------|
| Pen/Freehand Drawing | ✅ | PenTool.js |
| Highlight Tool | ✅ | 5 colors (yellow, green, blue, pink, orange) |
| Eraser Tool | ✅ | EraserTool.js |
| Text Tool | ✅ | TextTool.js |
| Shape Tool (rect, circle, line, arrow) | ✅ | ShapeTool.js |
| Comment/Sticky Notes | ✅ | CommentTool.js |
| Image Insert | ✅ | ImageTool.js |
| Underline/Strikethrough | ❌ | Missing |
| Callout Boxes | ❌ | Missing |

#### Stamps & Signatures
| Tool | Status | Notes |
|------|--------|-------|
| Stamp Tool | ✅ | 10 types (APPROVED, REJECTED, etc.) |
| Signature Tool | ✅ | Draw/upload modes |
| Date Stamp | ✅ | DateStampTool.js |
| Watermark Tool | ✅ | WatermarkTool.js |

#### Form Tools
| Tool | Status | Notes |
|------|--------|-------|
| Checkbox | ✅ | CheckboxTool.js |
| Text Field | ✅ | TextFieldTool.js |
| Radio Buttons | ❌ | Missing |
| Dropdown Fields | ❌ | Missing |

#### Redaction & Privacy
| Tool | Status | Notes |
|------|--------|-------|
| Black Bar Redaction | ✅ | RedactionTool.js |
| White Out Redaction | ✅ | RedactionTool.js |
| Blur/Pixelate | ❌ | Skipped |

#### Selection & Manipulation
| Tool | Status | Notes |
|------|--------|-------|
| Select Tool | ✅ | 8-point resize handles |
| Multi-select | ✅ | Unified resize/move |
| Move Tool | ✅ | MoveTool.js |
| Delete Tool | ✅ | DeleteTool.js |

#### Measurement & Utility
| Tool | Status | Notes |
|------|--------|-------|
| Measurement Tool | ✅ | Distance + area, multiple units |
| Zoom Tool | ✅ | 25%-200% range |
| Ruler/Grid Overlay | ❌ | Missing |

---

### ✨ QOL FEATURES

#### Viewing & Navigation
| Feature | Status | Notes |
|---------|--------|-------|
| Zoom In/Out | ✅ | Working |
| Page Thumbnails Sidebar | ✅ | PageManager.js |
| Dark Mode | ❌ | Missing |
| Multiple View Modes | ❌ | Missing |
| Full-screen Mode | ❌ | Missing |
| Custom Zoom Levels | ❌ | Only step increments |
| Read Aloud (TTS) | ❌ | Missing |

#### Editing Conveniences
| Feature | Status | Notes |
|---------|--------|-------|
| Undo/Redo | ✅ | Per-page stacks |
| Clear Page Annotations | ✅ | Working |
| Copy Text from PDF | ❌ | Missing |
| Search & Replace | ❌ | Skipped |
| Spell Check | ❌ | Skipped |

#### Document Properties
| Feature | Status | Notes |
|---------|--------|-------|
| View Document Properties | ❌ | Missing |
| Edit Metadata | ❌ | Missing |
| Remove Metadata | ⏳ | In WIP FileOperations.js |

#### Bookmarks & Links
| Feature | Status | Notes |
|---------|--------|-------|
| Create/Edit Bookmarks | ❌ | Missing |
| Add Hyperlinks | ❌ | Missing |
| Internal Page Links | ❌ | Missing |

#### Print
| Feature | Status | Notes |
|---------|--------|-------|
| Print Preview | ❌ | Missing |
| Print Settings | ❌ | Missing |

---

### ⚡ MACROS (Batch & Automation)
| Feature | Status | Notes |
|---------|--------|-------|
| Batch Operations (multi-file) | ❌ | Missing |
| Batch Conversion | ❌ | Missing |
| Batch Watermarking | ❌ | Missing |
| Batch Compression | ❌ | Missing |
| Custom Workflows/Pipelines | ❌ | Missing |
| Flatten Annotations | ⏳ | In WIP FileOperations.js |

---

### 📄 PAGE MANIPULATION
| Feature | Status | Notes |
|---------|--------|-------|
| Page Reordering (drag/drop) | ✅ | PageManager.js |
| Page Navigation via Thumbnails | ✅ | Working |
| Page Deletion | ❌ | Missing |
| Page Rotation (90°, 180°, 270°) | ❌ | Missing |
| Insert Blank Pages | ❌ | Missing |
| Duplicate Pages | ❌ | Missing |
| Extract Pages to New PDF | ⏳ | In WIP FileOperations.js |
| Page Cropping/Trim | ❌ | Missing |
| Add Page Numbers | ❌ | Missing |
| Headers/Footers | ❌ | Missing |
| Bates Numbering | ❌ | Missing |

---

### 📁 FILE OPERATIONS
| Feature | Status | Notes |
|---------|--------|-------|
| Save PDF with Annotations | ✅ | SavePDF.js |
| Load PDF | ✅ | PDFLoader.js |
| Merge Multiple PDFs | ⏳ | In WIP |
| Split PDF | ⏳ | In WIP |
| Compress PDF | ⏳ | In WIP |
| Password Protection | ⏳ | In WIP |
| Export to Images (PNG/JPG) | ⏳ | In WIP |
| PDF to Word/Excel/PPT | ❌ | Missing |
| Word/Images to PDF | ❌ | Missing |
| OCR | ❌ | Skipped |

---

### 📊 SUMMARY
| Category | Have | WIP | Missing |
|----------|------|-----|---------|
| Toolbar Tools | 20 | 0 | ~8 |
| QOL Features | 4 | 0 | ~15 |
| Macros | 0 | 1 | ~5 |
| Page Manipulation | 2 | 1 | ~8 |
| File Operations | 2 | 6 | ~10 |

---

### 🎯 RECOMMENDED PRIORITIES

**Immediate (finish current phase):**
1. Page Deletion
2. Page Rotation
3. Insert Blank Pages

**Next (Phase Beta):**
4. Merge PDFs (integrate from WIP)
5. Underline/Strikethrough tool
6. Dark Mode

**Then (Phase Gamma):**
7. Compress PDF (integrate from WIP)
8. Digital signatures with save
9. Export to Images (integrate from WIP)
10. Password protection (integrate from WIP)
