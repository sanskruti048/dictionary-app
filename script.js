const elements = {
  form: document.getElementById("searchForm"),
  input: document.getElementById("wordInput"),
  searchBtn: document.getElementById("searchBtn"),
  clearBtn: document.getElementById("clearBtn"),
  result: document.getElementById("result"),
  history: document.getElementById("history"),
  themeToggle: document.getElementById("themeToggle"),
};

const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// Persistent state
const storage = {
  get theme() {
    return localStorage.getItem("theme") || "dark";
  },
  set theme(value) {
    localStorage.setItem("theme", value);
  },
  get history() {
    try { return JSON.parse(localStorage.getItem("history") || "[]"); } catch { return []; }
  },
  set history(list) {
    localStorage.setItem("history", JSON.stringify(list.slice(0, 10)));
  },
  get cache() {
    try { return JSON.parse(localStorage.getItem("cache") || "{}"); } catch { return {}; }
  },
  set cache(map) {
    localStorage.setItem("cache", JSON.stringify(map));
  }
};

function applyTheme(theme) {
  const isLight = theme === "light";
  document.documentElement.classList.toggle("light", isLight);
  elements.themeToggle.textContent = isLight ? "🌞" : "🌙";
}

function setBusy(isBusy) {
  elements.result.setAttribute("aria-busy", String(isBusy));
}

function showMessage(message, isError = false) {
  elements.result.innerHTML = `<p class="${isError ? "empty-state" : ""}">${message}</p>`;
}

function renderHistory() {
  const terms = storage.history;
  if (!terms.length) {
    elements.history.innerHTML = "";
    return;
  }
  elements.history.innerHTML = terms.map(term => `<button class="chip" data-term="${term}">${term}</button>`).join("");
}

function pushHistory(term) {
  const list = storage.history.filter(t => t.toLowerCase() !== term.toLowerCase());
  list.unshift(term);
  storage.history = list;
  renderHistory();
}

function cacheGet(term) {
  const key = term.toLowerCase();
  const map = storage.cache;
  return map[key];
}

function cacheSet(term, data) {
  const key = term.toLowerCase();
  const map = storage.cache;
  map[key] = data;
  storage.cache = map;
}

function buildDefinitionsHTML(meanings) {
  return meanings.map(m => {
    const defs = (m.definitions || []).map(d => {
      const example = d.example ? `<br><em>Example:</em> ${escapeHTML(d.example)}` : "";
      return `<li><span class="badge">${escapeHTML(m.partOfSpeech || "")}</span> ${escapeHTML(d.definition)}${example}</li>`;
    }).join("");
    return defs;
  }).join("");
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"]+/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[s]));
}

function renderResult(data) {
  if (!Array.isArray(data) || !data.length) {
    showMessage("No results.");
    return;
  }
  const entry = data[0];
  const word = entry.word || "";
  const phoneticText = (entry.phonetic || (entry.phonetics?.find(p => p.text)?.text)) || "";
  const audioSrc = (entry.phonetics || []).find(p => p.audio)?.audio || "";

  const definitionsHTML = buildDefinitionsHTML(entry.meanings || []);

  elements.result.innerHTML = `
    <div class="result-header">
      <div class="word-title">
        <h2>${escapeHTML(word)}</h2>
        ${phoneticText ? `<span class="phonetic">${escapeHTML(phoneticText)}</span>` : ""}
      </div>
      ${audioSrc ? `<audio controls src="${audioSrc}"></audio>` : ""}
    </div>
    <ul class="definitions">${definitionsHTML}</ul>
    ${renderSynonyms(entry.meanings)}
  `;
}

function renderSynonyms(meanings = []) {
  const set = new Set();
  meanings.forEach(m => (m.definitions || []).forEach(d => (d.synonyms || []).forEach(s => set.add(s))));
  const list = Array.from(set);
  if (!list.length) return "";
  return `<p class="synonyms"><strong>Synonyms:</strong> ${list.map(escapeHTML).join(", ")}</p>`;
}

async function fetchWord(term) {
  const url = API_BASE + encodeURIComponent(term);
  const res = await fetch(url);
  if (!res.ok) {
    // API returns 404 for not found, with JSON message
    let detail = "";
    try {
      const errJson = await res.json();
      detail = errJson.title || errJson.message || "";
    } catch {}
    throw new Error(detail || "Word not found");
  }
  return res.json();
}

async function search(term) {
  const word = term.trim();
  if (!word) {
    showMessage("Please enter a word.", true);
    return;
  }
  setBusy(true);
  showMessage("Loading...");
  try {
    const cached = cacheGet(word);
    const data = cached || await fetchWord(word);
    if (!cached) cacheSet(word, data);
    renderResult(data);
    pushHistory(word);
  } catch (err) {
    showMessage(escapeHTML(err.message || "Something went wrong"), true);
  } finally {
    setBusy(false);
  }
}

// Event wiring
if (elements.form) {
  elements.form.addEventListener("submit", (e) => {
    e.preventDefault();
    search(elements.input.value);
  });
}

if (elements.clearBtn) {
  elements.clearBtn.addEventListener("click", () => {
    elements.input.value = "";
    elements.input.focus();
    elements.result.innerHTML = "";
  });
}

if (elements.history) {
  elements.history.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.matches(".chip")) {
      const term = target.getAttribute("data-term") || "";
      elements.input.value = term;
      search(term);
    }
  });
}

if (elements.themeToggle) {
  elements.themeToggle.addEventListener("click", () => {
    const newTheme = (storage.theme === "dark") ? "light" : "dark";
    storage.theme = newTheme;
    applyTheme(newTheme);
  });
}

// Init
(function init() {
  // Theme
  applyTheme(storage.theme);

  // Prefill from URL hash e.g. #word
  const initial = decodeURIComponent((location.hash || "").slice(1));
  if (initial) {
    elements.input.value = initial;
    search(initial);
  } else {
    showMessage("Type a word and press Enter to search.");
  }

  // Render history
  renderHistory();
})();
