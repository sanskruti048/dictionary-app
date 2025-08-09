## Dictionary App

A clean, responsive single‑page dictionary built with HTML, CSS, and JavaScript. It uses the Free Dictionary API to fetch definitions, phonetics (including audio when available), and synonyms.

### Live Demo

🔎 [app-dictionary-api.netlify.app](https://app-dictionary-api.netlify.app)

### Features
- **Instant search**: Press Enter or click Search to fetch definitions
- **Phonetics and audio**: Shows phonetic text and plays pronunciation when available
- **Synonyms**: Aggregated synonyms across meanings
- **Search history**: Last 10 searched words as clickable chips (persisted in localStorage)
- **Local caching**: Caches responses to reduce repeated API calls
- **Theme toggle**: Dark/Light themes with persistence
- **Accessible**: Announced results via `aria-live`, clear focus styles, semantic markup
- **Responsive**: Looks great on mobile and desktop

### Tech Stack
- **HTML**, **CSS**, **JavaScript** (no frameworks)
- Data: [Free Dictionary API](https://dictionaryapi.dev/)

## Getting Started

### Option 1: Open directly (no server)
1. Download/clone the project
2. Open `index.html` in your browser

### Option 2: Run a simple local server (recommended)
- Using VS Code: install the Live Server extension and "Open with Live Server" on `index.html`

- Using Python 3:
  ```bash
  python -m http.server 5500
  ```
  Then visit `http://localhost:5500` in your browser.

## Usage
- Type a word and press Enter (or click Search)
- Click a history chip to re-run a previous search
- Use the 🌙/🌞 button to toggle theme
- Deep link: open with a hash to prefill and search (e.g., `index.html#serendipity`)

## How It Works
- The app calls the Free Dictionary API: `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`
- Results are rendered with definitions, part of speech badges, examples, phonetics, and audio if available
- Searches and responses are persisted in `localStorage` (history and a small cache)
- Theme preference is persisted and applied on load

### Key Code
- UI wiring and search flow in `script.js`
  - Submit handler triggers `search()`
  - `fetchWord()` performs the API call with robust error handling
  - `renderResult()` builds structured HTML for results
  - History and cache are stored in `localStorage`
- Styling and themes are defined in `style.css` using CSS variables

## API
- Base URL:
  ```text
  https://api.dictionaryapi.dev/api/v2/entries/en/<word>
  ```
- Example fetch (from `script.js`):
  ```javascript
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`);
  if (!res.ok) {
    let detail = "";
    try {
      const errJson = await res.json();
      detail = errJson.title || errJson.message || "";
    } catch {}
    throw new Error(detail || "Word not found");
  }
  const data = await res.json();
  ```
- No API key required. The service may rate-limit if abused.


## License
- You can use this freely for learning or personal projects. If you plan to publish/distribute, consider adding a license of your choice (e.g., MIT) to the repository. 

## Author
**Sanskruti Sugandhi**  
🔗 GitHub: [@sanskruti048](https://github.com/sanskruti048)


