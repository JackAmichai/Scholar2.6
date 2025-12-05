# Scholar 2.6: AI Research Navigator

A Chrome Extension that overlays any webpage with an AI-driven conversational interface and interactive knowledge graph for academic research discovery.

## Features

- 🤖 **AI Conversational Loop**: Iterative intent refinement through dialogue
- 🌳 **Interactive Knowledge Graph**: Force-directed visualization with click-to-expand
- 🔬 **Semantic Scholar Integration**: Real academic paper data with SPECTER2 embeddings
- 🎨 **Shadow DOM Isolation**: No CSS conflicts with host pages
- ⚡ **Hot Module Replacement**: Vite-powered development experience

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. (Optional) Add API Keys

Copy `.env.example` to `.env` and add your keys:

```bash
cp .env.example .env
```

**Note**: The extension works with mock data without API keys for testing.

### 3. Development

```bash
npm run dev
```

This starts the Vite dev server with HMR.

### 4. Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

### 5. Test It

1. Navigate to any webpage
2. Click the floating blue/purple button in the bottom-right
3. Start chatting about your research topic!

## Project Structure

```
scholar-2.6/
├── manifest.json          # Chrome Extension manifest
├── src/
│   ├── background/        # Service worker
│   ├── content/           # Content script + App
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks (AI agent)
│   ├── utils/             # API clients
│   └── types/             # TypeScript definitions
├── vite.config.ts         # Vite + CRXJS config
└── tailwind.config.js     # Tailwind CSS config
```

## How It Works

### The "Loop"

1. User types broad query like "Computer Vision"
2. AI asks clarifying questions about:
   - **Scope**: Which subdomain?
   - **Timeframe**: Current or foundational?
   - **Focus**: Theory or applications?
3. After 1-3 rounds, AI calls `search_semantic_scholar()` function
4. Papers are fetched and displayed as an interactive graph

### The Graph

- Nodes = Papers (sized by log(citations))
- Links = Citation relationships
- Click to expand and fetch more related papers
- Physics simulation for natural layout

## API Integration

### Semantic Scholar

- **Endpoint**: `https://api.semanticscholar.org/graph/v1`
- **Rate Limit**: 100 requests / 5 minutes (free tier)
- **Features**: SPECTER2 embeddings for similarity

### OpenAI

- **Model**: GPT-4 Turbo
- **Feature**: Function Calling for intent detection

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

## Next Steps

-  Add "unfold" mechanism (fetch citations on node click)
- [ ] Implement vector similarity clustering
- [ ] Add chronological force to graph
- [ ] Create paper detail tooltips
- [ ] Add export functionality (BibTeX, JSON)
- [ ] Backend proxy for API keys

## License

MIT
