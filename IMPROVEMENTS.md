# Potential Improvements for Scholar 2.6

## Graph Visualization & Interaction
1. **Interactive Initial Graph:** Automatically fetch and display citations between the initially found papers so the graph isn't disconnected at start.
2. **Cluster Coloring:** Use embedding vectors (if available) to color-code nodes by semantic similarity rather than just random or citation order.
3. **Timeline View:** A toggleable view that arranges papers purely by year (Y-axis) and citation count (X-axis) or vice versa.
4. **"Focus Mode":** When a node is clicked, fade out all non-connected nodes to highlight the citation path.
5. **Saved Graphs:** Allow users to name and save specific graph states to `chrome.storage` for later retrieval.
6. **Live Layout Toggles:** Buttons to switch between different force-graph forces (e.g., standard, tree-like, radial).

## Research Agent & Data
7. **Export to Zotero:** Integrate with Zotero API to directly save papers to the user's library.
8. **PDF Direct Link:** If open access, provide a direct button to open the PDF.
9. **Snippet Extraction:** Use the LLM to extract the "Main Contribution" or "Methodology" specifically and display it in the tooltip.
10. **Persistent Chat History:** Allow multiple chat sessions/threads, saved locally.
11. **Batch Search:** Allow users to paste a list of paper titles and generate a graph from them instantly.
12. **Author Graph:** A mode to switch nodes from "Papers" to "Authors" to see collaboration networks.
13. **Local LLM Support:** Add support for running small models (like TinyLlama) via WebGPU (WebLLM) for privacy.
14. **Custom API Endpoints:** Allow users to point to a local OpenAI-compatible endpoint (e.g., Ollama).

## UI/UX
15. **Keyboard Shortcuts:** Add shortcuts for Zoom (Ctrl+/-), Reset (R), and Search (Ctrl+F) within the overlay.
16. **Draggable Overlay:** Allow the user to move the chat/graph bubble to any corner of the screen.
17. **Theme Customization:** Allow users to pick custom primary colors for the UI beyond the preset schemes.
18. **Mobile View:** Optimize the overlay for mobile browsers (if ported to mobile extensions like Orion/Kiwi).
19. **Accessibility Mode:** High contrast text and screen-reader friendly descriptions for graph nodes.

## Cross-Browser & System
20. **Safari Web Extension Support:** Add build scripts and polyfills to ensure full compatibility with Safari on macOS/iOS.
