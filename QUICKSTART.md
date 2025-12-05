# Scholar 2.6: Quick Start Guide

## 🚀 Your Extension is Built!

The Scholar 2.6 Chrome Extension is now compiled and ready to install.

**Build Output**: `/Users/jackamichai/.gemini/antigravity/scratch/scholar-2.6/dist/`

---

## 📦 Install in Chrome

### Step 1: Open Extensions Page

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "**Developer mode**" (toggle in top-right)

### Step 2: Load Extension

1. Click "**Load unpacked**"
2. Navigate to and select:
   ```
   /Users/jackamichai/.gemini/antigravity/scratch/scholar-2.6/dist
   ```
3. The extension should now appear in your list!

---

## 🧪 Test It Out

### Basic Test (No API Keys Needed)

The extension works with **mock data** out of the box!

1. **Navigate to any webpage** (try `google.com`)
2. **Look for the FAB** (floating button) in the bottom-right corner
   - Blue/purple gradient circle with a chat icon
3. **Click the FAB** to open the chat overlay
4. **Type**: "Computer Vision"
5. **Watch the AI respond** with clarifying questions
6. **Continue answering** (the AI will ask 2-3 questions)
7. **See the graph render** with 10 mock papers!

### Interactions

- **Click graph nodes** (unfold mechanism is partially implemented)
- **Zoom controls**: Use +, -, reset buttons
- **Back to chat**: Click "Back to Chat" button
- **Close**: Click the X button

---

## 🔑 Optional: Add Real API Keys

To get **real OpenAI responses** and **actual papers from Semantic Scholar**:

### 1. Create `.env` file

```bash
cd /Users/jackamichai/.gemini/antigravity/scratch/scholar-2.6
cp .env.example .env
```

### 2. Edit `.env` and add your keys:

```
VITE_OPENAI_API_KEY=sk-...your_key_here
VITE_S2_API_KEY=optional_semantic_scholar_key
```

### 3. Rebuild:

```bash
npm run build
```

### 4. Reload extension:

- Go to `chrome://extensions/`
- Click the refresh icon on your Scholar 2.6 extension

---

## 🎯 What Works Right Now

✅ **Shadow DOM Injection** - Style isolation from host pages  
✅ **FAB Toggle** - Show/hide overlay  
✅ **AI Chat Interface** - Conversational loop with mock responses  
✅ **Intent Refinement** - Asks clarifying questions about research topic  
✅ **Graph Visualization** - Force-directed layout with react-force-graph-2d  
✅ **Zoom Controls** - Pan, zoom in/out, reset view  
✅ **View Transitions** - Smooth switching between chat and graph  

---

## 🚧 What's Next (Not Yet Implemented)

- [ ] **Node Unfold Mechanism** - Click nodes to fetch and display citations
- [ ] **Vector Similarity Clustering** - Use SPECTER2 embeddings
- [ ] **Paper Detail Tooltips** - Show abstracts on hover
- [ ] **Chronological Force** - Timeline-based graph layout
- [ ] **BibTeX Export** - Download references
- [ ] **Real OpenAI Integration** - (needs API key)
- [ ] **Real Semantic Scholar Integration** - (works but using mocks currently)

---

## 🐛 Troubleshooting

### Extension doesn't appear

- Make sure you selected the `dist` folder, not the project root
- Check for errors in `chrome://extensions/` under your extension

### FAB doesn't show

- Refresh the webpage after installing
- Check browser console (F12) for errors
- Verify the extension is enabled

### Graph looks empty

- This is normal if the AI hasn't completed the conversation yet
- Make sure you answer all clarifying questions
- Check console for API errors

---

## 🛠️ Development

To continue development:

```bash
# Start dev server with HMR
npm run dev

# Rebuild after changes
npm run build

# Then reload extension in Chrome
```

---

## 📁 Project Structure

```
scholar-2.6/
├── dist/                    ← Built extension (load this in Chrome)
├── public/                  ← Extension icons
├── src/
│   ├── background/          ← Service worker
│   ├── content/             ← Shadow DOM injection + App
│   ├── components/          ← React components (FAB, Chat, Graph)
│   ├── hooks/               ← AI conversation loop
│   ├── utils/               ← API clients
│   └── types/               ← TypeScript definitions
└── manifest.json            ← Extension configuration
```

---

## 🎓 Next Steps for Full Implementation

See [`implementation_plan.md`](file:///Users/jackamichai/.gemini/antigravity/brain/5b1292fc-157c-4855-bffd-e1941f12de7d/implementation_plan.md) for the complete roadmap.

**Priority: Implement the unfold mechanism** in [`GraphView.tsx`](file:///Users/jackamichai/.gemini/antigravity/scratch/scholar-2.6/src/components/GraphView.tsx) to make nodes expandable!

---

**Status**: ✅ **Ready to Install & Test!**
