# Claude Development Notes

## Important Reminders

- **Make sure tool that I'm currently working on WORKS with all other tools.**
  - Test selection/deselection behavior
  - Test undo/redo functionality
  - Test interaction with move, delete, and eraser tools
  - Verify saving to PDF works correctly

## Token Usage Optimization

- **NO TodoWrite** - Skip task tracking, just work
- **Read with offset/limit** - Only read needed file sections
- **Be concise** - Skip explanations, just code
- **User should be direct** - Specific tasks, not exploration

## Project Status

### Phase 1: Complete ✅
- Basic PDF annotation tools
- Multi-select with unified resize and move
- Bug fixes and code organization

### Phase 2: In Progress 🚧

#### Milestone 1: Redaction & Privacy Tools
- ✅ Black Bar Redaction Tool - IMPLEMENTED
- ✅ White Out Tool - IMPLEMENTED
- ⏭️ Blur/Pixelate Tool - SKIPPED (optional)

#### Milestone 2: Form Filling & Interactive Elements (From WIP Folder)

**High Priority - Core Form Tools:**
- ⏳ Checkbox tool - Ready to implement (FormTools.js)
- ⏳ Text field boxes - Ready to implement (FormTools.js)
- ⏳ Date stamps - Ready to implement (FormTools.js)

**Medium Priority - Additional Features:**
- ⏳ Comment/Annotation Tool - Available (CommentTool.js)
- ⏳ Watermark Tool - Available (WatermarkTool.js)

**Low Priority - Advanced Features:**
- ⏳ Measurement Tool - Available (MeasurementTool.js)
- ⏳ Page Manager - Available (PageManager.js)
- ⏳ File Operations - Available (FileOperations.js)

### Recommended Next Steps:
1. **Checkbox Tool** (Highest value, quick win)
2. **Date Stamp Tool** (Highly requested feature)
3. **Text Field Tool** (More complex, form completion)

### Phases 3 & 4: Skipped
- Find/replace
- Spell check
- OCR
- (Focus on annotation tools that layer on top of PDFs)
