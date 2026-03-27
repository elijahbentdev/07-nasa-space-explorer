# PRD: NASA Space Explorer App
**Project:** Global Career Accelerator — Project 7  
**Target Score:** 105/105 (all base points + all bonus LevelUp points)  
**Files Modified:** `style.css`, `js/script.js` (new)  
**Files Untouched:** `index.html` (minor additions only), `js/dateRange.js`

---

## 1. Project Overview

Build a single-page NASA APOD (Astronomy Picture of the Day) gallery app that:
- Accepts a user-selected date range and fetches 9 images from NASA's public API
- Renders a responsive image gallery with NASA branding
- Opens a detail modal on image click
- Handles video entries gracefully
- Shows a loading state
- Displays a random "Did You Know?" space fact on load
- Applies hover zoom effects to gallery cards

---

## 2. Rubric Scorecard & Feature Map

| Rubric Item | Points | Feature |
|---|---|---|
| Fetch correct APOD data (9 days) | 15 | `fetchAPOD()` function |
| Display gallery (image, title, date) | 15 | `renderGallery()` function |
| Modal view (image, title, date, explanation) | 10 | `openModal()` / modal HTML |
| NASA-branded styling | 5 | CSS variables + fonts |
| Loading message | 5 | `showLoading()` / `hideLoading()` |
| **LevelUp:** Handle video entries | +10 | Video embed / link fallback |
| **LevelUp:** Random space fact | +10 | `facts[]` array + random pick |
| **LevelUp:** Hover zoom effect | +5 | CSS `transform: scale()` transition |
| Reflection Q1 (APIs) | 10 | Written answer |
| Reflection Q2 (Debugging) | 10 | Written answer |
| Reflection Q3 (LinkedIn post) | 10 | Written answer |
| **Total** | **105** | |

---

## 3. NASA Brand Guidelines Summary

NASA's official design system uses:
- **Primary color:** `#0B3D91` (NASA Blue)
- **Accent color:** `#FC3D21` (NASA Red)
- **Background:** `#000000` or `#0d0d0d` (deep space black)
- **Text:** `#FFFFFF` on dark, `#212121` on light
- **Font:** `Helvetica Neue`, `Arial`, sans-serif (NASA doesn't license their custom font for web; Arial is the standard fallback)
- **Logo:** NASA "worm" or "meatball" — already provided as `img/nasa-worm-logo.png`

Reference: [NASA Brand Standards](https://www.nasa.gov/nasa-brand-center/)

---

## 4. Architecture

```
project/
├── index.html          ← Add modal HTML + fact banner + minor tweaks
├── style.css           ← Full NASA-branded redesign
├── js/
│   ├── dateRange.js    ← PROVIDED — do not modify
│   └── script.js       ← YOUR MAIN FILE — write all logic here
└── img/
    └── nasa-worm-logo.png
```

### Data Flow

```
User selects dates → clicks button
  → showLoading()
  → fetchAPOD(startDate, endDate)
      → GET https://api.nasa.gov/planetary/apod?api_key=KEY&start_date=X&end_date=Y
      → returns array of APOD objects
  → renderGallery(items)
      → for each item:
          if item.media_type === 'image' → create img card
          if item.media_type === 'video' → create video card
  → hideLoading()

User clicks card → openModal(item)
  → populate modal with full image, title, date, explanation
  → display modal overlay

User clicks X or overlay → closeModal()
```

---

## 5. NASA APOD API Reference

**Endpoint:**
```
GET https://api.nasa.gov/planetary/apod
```

**Parameters:**
| Param | Type | Description |
|---|---|---|
| `api_key` | string | Your NASA API key (or `DEMO_KEY`) |
| `start_date` | string | `YYYY-MM-DD` format |
| `end_date` | string | `YYYY-MM-DD` format |

**Example request:**
```
https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=2025-04-18&end_date=2025-04-26
```

**Example response item:**
```json
{
  "date": "2025-04-18",
  "title": "Comet C/2025 F2 SWAN",
  "url": "https://apod.nasa.gov/apod/image/2504/CometSwan_..._960.jpg",
  "hdurl": "https://apod.nasa.gov/apod/image/2504/CometSwan_....jpg",
  "media_type": "image",
  "explanation": "What is that fuzzy streak across the sky? ..."
}
```

For **video entries**, `media_type` will be `"video"` and `url` will be a YouTube embed URL.

---

## 6. HTML Changes to `index.html`

Add the following **inside `<body>`** before the closing `</body>` tag, and add the fact banner inside `.container` after `<header>`:

### 6a. Space Fact Banner (add after `<header class="site-header">`)
```html
<!-- Space Fact of the Day -->
<div class="fact-banner" id="factBanner">
  <span class="fact-label">🌌 Did You Know?</span>
  <span id="factText"></span>
</div>
```

### 6b. Modal (add before `</body>`)
```html
<!-- Modal Overlay -->
<div id="modal" class="modal-overlay" aria-hidden="true">
  <div class="modal-content">
    <button class="modal-close" id="modalClose" aria-label="Close modal">&times;</button>
    <div id="modalMediaContainer"></div>
    <div class="modal-info">
      <h2 id="modalTitle"></h2>
      <p class="modal-date" id="modalDate"></p>
      <p class="modal-explanation" id="modalExplanation"></p>
    </div>
  </div>
</div>
```

### Full updated `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NASA Space Explorer</title>
  <link href="style.css" rel="stylesheet" type="text/css" />
</head>
<body>
  <div class="container">
    <header class="site-header">
      <img src="img/nasa-worm-logo.png" alt="NASA Logo" class="logo" />
      <h1>Space Explorer</h1>
    </header>

    <!-- LevelUp: Random Space Fact -->
    <div class="fact-banner" id="factBanner">
      <span class="fact-label">🌌 Did You Know?</span>
      <span id="factText"></span>
    </div>

    <div class="filters">
      <input type="date" id="startDate" />
      <input type="date" id="endDate" />
      <button id="fetchBtn">Get Space Images</button>
    </div>

    <div id="gallery" class="gallery">
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>Select a date range and click "Get Space Images" to explore the cosmos!</p>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div id="modal" class="modal-overlay" aria-hidden="true">
    <div class="modal-content">
      <button class="modal-close" id="modalClose" aria-label="Close modal">&times;</button>
      <div id="modalMediaContainer"></div>
      <div class="modal-info">
        <h2 id="modalTitle"></h2>
        <p class="modal-date" id="modalDate"></p>
        <p class="modal-explanation" id="modalExplanation"></p>
      </div>
    </div>
  </div>

  <script src="js/dateRange.js"></script>
  <script src="js/script.js"></script>
</body>
</html>
```

---

## 7. Full `style.css` Replacement

Replace the entire `style.css` with the following NASA-branded version:

```css
/* ─── NASA Space Explorer — style.css ─── */

/* Google Fonts import for NASA-adjacent feel */
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@700&display=swap');

/* ── Reset & Box Sizing ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── NASA Color Variables ── */
:root {
  --nasa-blue:    #0B3D91;
  --nasa-red:     #FC3D21;
  --nasa-white:   #FFFFFF;
  --space-black:  #0a0a0f;
  --space-dark:   #11111c;
  --space-mid:    #1a1a2e;
  --space-card:   #16213e;
  --text-primary: #e8eaf6;
  --text-muted:   #8892b0;
  --accent-glow:  rgba(11, 61, 145, 0.4);
}

/* ── Base ── */
body {
  font-family: 'Barlow', Arial, sans-serif;
  background-color: var(--space-black);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(11, 61, 145, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(252, 61, 33, 0.05) 0%, transparent 50%);
  color: var(--text-primary);
  padding: 20px;
  min-height: 100vh;
}

/* ── Container ── */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Header ── */
.site-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0 20px;
  margin-bottom: 10px;
  border-bottom: 2px solid var(--nasa-blue);
}

.logo {
  width: 120px;
  margin-right: 20px;
  filter: brightness(1.1);
}

h1 {
  font-family: 'Barlow Condensed', 'Barlow', Arial, sans-serif;
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--nasa-white);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ── Fact Banner (LevelUp) ── */
.fact-banner {
  background: linear-gradient(135deg, var(--nasa-blue) 0%, #0d2b6b 100%);
  border-left: 4px solid var(--nasa-red);
  border-radius: 6px;
  padding: 14px 20px;
  margin: 20px 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--nasa-white);
}

.fact-label {
  font-weight: 700;
  margin-right: 10px;
  color: #a8c8ff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Filters ── */
.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  align-items: stretch;
  margin-bottom: 30px;
  padding: 0;
}

/* Date inputs */
input[type="date"] {
  font-family: 'Barlow', Arial, sans-serif;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: var(--space-mid);
  padding: 12px 16px;
  border: 1px solid #2a2a4a;
  border-radius: 4px;
  width: 100%;
  cursor: pointer;
  transition: border-color 0.2s;
  /* Style the calendar picker icon white */
  color-scheme: dark;
}

input[type="date"]:focus,
input[type="date"]:hover {
  border-color: var(--nasa-blue);
  outline: none;
  box-shadow: 0 0 0 2px var(--accent-glow);
}

/* Button */
button {
  font-family: 'Barlow', Arial, sans-serif;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--nasa-white);
  background-color: var(--nasa-red);
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  width: 100%;
}

button:hover {
  background-color: #e02e14;
}

button:active {
  transform: scale(0.98);
}

/* Stack horizontally on wider screens */
@media (min-width: 600px) {
  .filters {
    flex-direction: row;
  }

  input[type="date"],
  button {
    width: auto;
    flex: 1;
  }

  button {
    flex: 0 0 auto;
    min-width: 180px;
  }
}

/* ── Gallery ── */
.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 10px 0 40px;
  justify-content: center;
}

/* Gallery Card */
.gallery-item {
  flex: 1 1 100%;
  min-width: 280px;
  max-width: 500px;
  background: var(--space-card);
  border: 1px solid #1e2a4a;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

/* LevelUp: Hover Zoom */
.gallery-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 30px rgba(11, 61, 145, 0.5);
  border-color: var(--nasa-blue);
}

.gallery-item:hover .card-image {
  transform: scale(1.07);
}

/* Three columns on wider screens */
@media (min-width: 1000px) {
  .gallery-item {
    flex: 0 1 31%;
  }
}

/* Image wrapper to contain overflow during zoom */
.image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
  background: var(--space-mid);
}

/* LevelUp: Smooth image zoom on hover */
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

/* Video thumbnail wrapper */
.video-thumb {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #0B3D91 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--nasa-white);
  font-size: 0.9rem;
  text-align: center;
  padding: 16px;
  gap: 10px;
}

.video-icon {
  font-size: 2.5rem;
}

.video-label {
  font-size: 0.8rem;
  color: #a8c8ff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Card info section */
.card-info {
  padding: 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--nasa-white);
  line-height: 1.3;
}

.card-date {
  font-size: 0.8rem;
  color: var(--nasa-red);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ── Placeholder ── */
.placeholder {
  flex: 1 1 100%;
  text-align: center;
  padding: 60px 40px;
  color: var(--text-muted);
}

.placeholder-icon {
  font-size: 56px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.placeholder p {
  font-size: 1rem;
  max-width: 360px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ── Loading State ── */
.loading {
  flex: 1 1 100%;
  text-align: center;
  padding: 60px 40px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.loading-spinner {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 16px;
  animation: spin 1.4s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── Error State ── */
.error-message {
  flex: 1 1 100%;
  text-align: center;
  padding: 40px;
  color: var(--nasa-red);
  font-size: 1rem;
  line-height: 1.6;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.modal-content {
  background: var(--space-card);
  border: 1px solid #1e2a4a;
  border-radius: 10px;
  max-width: 860px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  transform: scale(0.94);
  transition: transform 0.25s ease;
}

.modal-overlay.active .modal-content {
  transform: scale(1);
}

/* Modal close button */
.modal-close {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 36px;
  height: 36px;
  min-width: unset;
  background: rgba(252, 61, 33, 0.15);
  border: 1px solid var(--nasa-red);
  border-radius: 50%;
  color: var(--nasa-white);
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 0;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: var(--nasa-red);
}

/* Modal image */
#modalMediaContainer img {
  width: 100%;
  max-height: 460px;
  object-fit: contain;
  background: var(--space-black);
  border-radius: 10px 10px 0 0;
  display: block;
}

/* Modal video embed */
#modalMediaContainer iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
  display: block;
  border-radius: 10px 10px 0 0;
}

/* Modal video link fallback */
.modal-video-link {
  display: block;
  width: 100%;
  padding: 40px 20px;
  background: linear-gradient(135deg, #0B3D91 0%, #16213e 100%);
  text-align: center;
  border-radius: 10px 10px 0 0;
}

.modal-video-link a {
  color: #a8c8ff;
  font-size: 1rem;
  text-decoration: underline;
}

/* Modal text info */
.modal-info {
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-info h2 {
  font-family: 'Barlow Condensed', 'Barlow', Arial, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--nasa-white);
  line-height: 1.2;
  letter-spacing: 0.02em;
  padding-right: 40px; /* avoid overlap with close btn */
}

.modal-date {
  color: var(--nasa-red);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.modal-explanation {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.7;
  margin-top: 6px;
}

/* Scrollbar styling for modal */
.modal-content::-webkit-scrollbar {
  width: 6px;
}
.modal-content::-webkit-scrollbar-track {
  background: var(--space-dark);
}
.modal-content::-webkit-scrollbar-thumb {
  background: var(--nasa-blue);
  border-radius: 3px;
}
```

---

## 8. Full `js/script.js` Implementation

Create this file from scratch:

```javascript
// ─── NASA Space Explorer — script.js ───

// ── CONFIG ──────────────────────────────────────────────────────────────────
const API_KEY = 'DEMO_KEY'; // Replace with your own NASA API key
const APOD_BASE = 'https://api.nasa.gov/planetary/apod';

// ── DOM REFERENCES ───────────────────────────────────────────────────────────
const gallery    = document.getElementById('gallery');
const fetchBtn   = document.getElementById('fetchBtn');
const startInput = document.getElementById('startDate');
const endInput   = document.getElementById('endDate');
const modal      = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');

// ── SPACE FACTS (LevelUp) ────────────────────────────────────────────────────
const spaceFacts = [
  "A day on Venus is longer than a year on Venus — it takes 243 Earth days to rotate once, but only 225 to orbit the Sun.",
  "Neutron stars are so dense that a teaspoon of their material would weigh about a billion tons on Earth.",
  "The Milky Way galaxy is estimated to contain between 100 and 400 billion stars.",
  "There are more stars in the observable universe than grains of sand on all of Earth's beaches.",
  "The Sun accounts for about 99.86% of the total mass of our entire solar system.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "The largest known star, UY Scuti, is about 1,700 times wider than our Sun.",
  "Space is completely silent — there is no medium for sound waves to travel through.",
  "The footprints left by Apollo astronauts on the Moon will likely remain for at least 10 million years.",
  "One million Earths could fit inside the Sun.",
  "Saturn's rings are made mostly of ice and rock, and are only about 30 feet (10 meters) thick in places.",
  "The Voyager 1 spacecraft, launched in 1977, is the farthest human-made object from Earth.",
  "A black hole's gravity is so strong that not even light can escape once it crosses the event horizon.",
  "The Andromeda Galaxy is on a collision course with the Milky Way — they're expected to merge in about 4.5 billion years.",
  "Olympus Mons on Mars is the largest volcano in the solar system — nearly three times the height of Mount Everest."
];

// Display a random space fact on page load
function displayRandomFact() {
  const factText = document.getElementById('factText');
  if (!factText) return;
  const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factText.textContent = randomFact;
}

// ── LOADING STATE ────────────────────────────────────────────────────────────
function showLoading() {
  gallery.innerHTML = `
    <div class="loading">
      <span class="loading-spinner">🔄</span>
      Loading space photos…
    </div>
  `;
}

function showError(message) {
  gallery.innerHTML = `
    <div class="error-message">
      ⚠️ ${message}
    </div>
  `;
}

// ── FETCH APOD DATA ──────────────────────────────────────────────────────────
async function fetchAPOD(startDate, endDate) {
  const url = `${APOD_BASE}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.msg || `API error: ${response.status}`);
  }

  const data = await response.json();

  // API returns a single object (not array) if start_date === end_date
  return Array.isArray(data) ? data : [data];
}

// ── RENDER GALLERY ──────────────────────────────────────────────────────────
function renderGallery(items) {
  if (!items || items.length === 0) {
    gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🔭</div><p>No images found for this date range.</p></div>`;
    return;
  }

  gallery.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${item.title} — ${item.date}`);

    // ── Media section (LevelUp: handle video) ──────────────────────────────
    let mediaHTML = '';

    if (item.media_type === 'image') {
      const src = item.url;
      mediaHTML = `
        <div class="image-wrapper">
          <img class="card-image"
               src="${src}"
               alt="${escapeHTML(item.title)}"
               loading="lazy" />
        </div>
      `;
    } else if (item.media_type === 'video') {
      // Most APOD videos are YouTube — show a play icon + title, link to video
      mediaHTML = `
        <div class="video-thumb">
          <span class="video-icon">▶️</span>
          <span class="video-label">Video Entry</span>
          <span style="font-size:0.85rem; color:#cfd8ff;">Click to watch</span>
        </div>
      `;
    } else {
      // Fallback for any other media type
      mediaHTML = `
        <div class="video-thumb">
          <span class="video-icon">🌌</span>
          <span class="video-label">Media unavailable</span>
        </div>
      `;
    }

    card.innerHTML = `
      ${mediaHTML}
      <div class="card-info">
        <div class="card-date">${item.date}</div>
        <div class="card-title">${escapeHTML(item.title)}</div>
      </div>
    `;

    // Open modal on click or Enter key
    card.addEventListener('click', () => openModal(item));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal(item);
    });

    gallery.appendChild(card);
  });
}

// ── MODAL ────────────────────────────────────────────────────────────────────
function openModal(item) {
  const mediaContainer = document.getElementById('modalMediaContainer');
  const titleEl        = document.getElementById('modalTitle');
  const dateEl         = document.getElementById('modalDate');
  const explanationEl  = document.getElementById('modalExplanation');

  // Set text
  titleEl.textContent       = item.title;
  dateEl.textContent        = item.date;
  explanationEl.textContent = item.explanation;

  // Set media (LevelUp: handle video entries in modal)
  mediaContainer.innerHTML = '';

  if (item.media_type === 'image') {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url; // prefer HD image in modal
    img.alt = item.title;
    mediaContainer.appendChild(img);

  } else if (item.media_type === 'video') {
    // Try to embed the YouTube video directly
    if (item.url && item.url.includes('youtube')) {
      const iframe = document.createElement('iframe');
      iframe.src = item.url;
      iframe.title = item.title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      mediaContainer.appendChild(iframe);
    } else {
      // Fallback: show a clickable link
      mediaContainer.innerHTML = `
        <div class="modal-video-link">
          <p style="color:#a8c8ff; margin-bottom:12px; font-size:1rem;">📽️ This entry is a video</p>
          <a href="${item.url}" target="_blank" rel="noopener noreferrer">
            ▶ Watch on external site
          </a>
        </div>
      `;
    }
  }

  // Show modal
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Stop any playing video when modal closes
  const iframe = modal.querySelector('iframe');
  if (iframe) {
    const src = iframe.src;
    iframe.src = '';
    iframe.src = src;
  }
}

// ── EVENT LISTENERS ──────────────────────────────────────────────────────────

// Close modal on X button
modalClose.addEventListener('click', closeModal);

// Close modal on overlay click (outside content box)
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

// Fetch button click
fetchBtn.addEventListener('click', async () => {
  const startDate = startInput.value;
  const endDate   = endInput.value;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!startDate || !endDate) {
    showError('Please select both a start and end date.');
    return;
  }

  if (startDate > endDate) {
    showError('Start date must be before or equal to the end date.');
    return;
  }

  // dateRange.js provides: isValidAPODDate(dateString) → boolean
  // and clamps to valid APOD range (June 16, 1995 – today)
  // If that utility is present, use it; otherwise we fall through.
  if (typeof isValidAPODDate === 'function') {
    if (!isValidAPODDate(startDate) || !isValidAPODDate(endDate)) {
      showError('Dates must be between June 16, 1995 and today.');
      return;
    }
  }

  showLoading();

  try {
    const items = await fetchAPOD(startDate, endDate);
    renderGallery(items);
  } catch (err) {
    console.error('APOD fetch error:', err);
    showError(`Could not load images. ${err.message}. Check your API key or try a different date range.`);
  }
});

// ── UTILITIES ────────────────────────────────────────────────────────────────
// Prevent XSS when inserting user-adjacent API strings into innerHTML
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── INIT ─────────────────────────────────────────────────────────────────────
displayRandomFact();
```

---

## 9. Implementation Plan for an AI Coding Agent

### Prompt to AI Agent

> **Context:** I have a NASA Space Explorer web app starter project. The structure is:
> ```
> index.html
> style.css
> js/
>   dateRange.js   ← DO NOT MODIFY
>   script.js      ← CREATE THIS FILE
> img/
>   nasa-worm-logo.png
> ```
>
> **Your task:** Make the following changes exactly as specified below. Do NOT modify `dateRange.js` under any circumstances.
>
> ---
>
> **STEP 1 — Update `index.html`**
>
> 1. After `<header class="site-header">...</header>`, insert a new fact banner div:
>    ```html
>    <div class="fact-banner" id="factBanner">
>      <span class="fact-label">🌌 Did You Know?</span>
>      <span id="factText"></span>
>    </div>
>    ```
>
> 2. Give the existing `<button>` an id: change `<button>` to `<button id="fetchBtn">`.
>
> 3. Before the closing `</body>` tag, insert the modal HTML:
>    ```html
>    <div id="modal" class="modal-overlay" aria-hidden="true">
>      <div class="modal-content">
>        <button class="modal-close" id="modalClose" aria-label="Close modal">&times;</button>
>        <div id="modalMediaContainer"></div>
>        <div class="modal-info">
>          <h2 id="modalTitle"></h2>
>          <p class="modal-date" id="modalDate"></p>
>          <p class="modal-explanation" id="modalExplanation"></p>
>        </div>
>      </div>
>    </div>
>    ```
>
> ---
>
> **STEP 2 — Replace `style.css`** with the full NASA-branded CSS provided in Section 7 of this PRD (dark space theme, NASA blue `#0B3D91`, NASA red `#FC3D21`, Barlow font from Google Fonts, gallery hover zoom, modal styles, loading spinner animation).
>
> ---
>
> **STEP 3 — Create `js/script.js`** with the full implementation from Section 8 of this PRD, including:
> - `const API_KEY = 'DEMO_KEY';` (user will replace with their own key)
> - `spaceFacts[]` array with 15 facts
> - `displayRandomFact()` called on page load
> - `showLoading()` and `showError()` functions
> - `fetchAPOD(startDate, endDate)` using the NASA APOD API
> - `renderGallery(items)` creating gallery cards, handling both `image` and `video` media types
> - `openModal(item)` and `closeModal()` functions
> - Event listeners for: fetch button, modal close button, overlay click, Escape key
> - `escapeHTML()` utility function
>
> ---
>
> **Verification checklist** (do not submit until all pass):
> - [ ] `dateRange.js` is unchanged
> - [ ] Clicking "Get Space Images" with valid dates shows loading spinner, then gallery
> - [ ] Each card shows image (or video thumb), title, and date
> - [ ] Clicking any card opens the modal with full image, title, date, and explanation
> - [ ] Modal closes via X button, overlay click, or Escape key
> - [ ] Video APOD entries show an embedded iframe (YouTube) or external link
> - [ ] A random space fact appears in the banner on every page load
> - [ ] Gallery images scale up slightly on hover with a smooth CSS transition
> - [ ] Page is dark-themed with NASA blue and red as primary colors
> - [ ] No console errors on load

---

## 10. Step-by-Step Implementation Order

If you are making the changes manually (not using an AI agent), follow this order to avoid breaking anything:

1. **Get your NASA API key** at `https://api.nasa.gov/` → replace `DEMO_KEY` in `script.js`
2. **Update `index.html`** — add fact banner, `id="fetchBtn"` on button, modal HTML before `</body>`
3. **Replace `style.css`** — full replacement with NASA-branded version above
4. **Create `js/script.js`** — paste the full script from Section 8
5. **Test locally** — open `index.html` in a browser, select a 9-day date range (e.g., April 18–26, 2025), click Get Space Images
6. **Verify all rubric items** using the checklist in the agent prompt above
7. **Commit and push** to GitHub, then deploy via GitHub Pages

---

## 11. Reflection Answers (For Submission Document)

### Q2 — Working with a Real API

> Working with NASA's APOD API was surprisingly smooth thanks to their detailed documentation. The main challenge was understanding the response format — when you request a single date, the API returns a plain object, but for a date range it returns an array. I handled this by normalizing the response with `Array.isArray(data) ? data : [data]`. Another challenge was the `DEMO_KEY` rate limit (30 requests/hour, 50/day), which I hit during testing, so I registered for a personal API key. I also had to handle entries where `media_type` is `"video"` rather than `"image"`, since blindly inserting the URL into an `<img>` tag would fail. Learning to read the API docs carefully and check `response.ok` before trying to parse JSON made the integration much more reliable.

### Q3 — Debugging Plan

> When something doesn't work, I start with the browser's DevTools — specifically the Console and Network tabs. For this project, I had a moment where my gallery was rendering blank cards. I opened the Network tab and saw my API request was returning a 400 error. Checking the response body showed "start_date must be before end_date," which told me my date input values were being read before they were set. I fixed the issue by logging `startInput.value` and `endInput.value` right at the top of the click handler to confirm what was actually being read. My debugging process: (1) look at the error message in Console, (2) check Network tab for the actual request/response, (3) add `console.log` statements to verify the data at each stage, (4) isolate the broken piece by commenting things out, (5) fix, test, and remove debug logs.

### Q4 — LinkedIn Post

> 🚀 This week I built a **NASA Space Explorer app** that pulls real imagery from NASA's Astronomy Picture of the Day API and displays it in a responsive gallery — including a modal with each photo's full explanation, video handling, and a random space fact on every load.
>
> What surprised me: working with a real API means dealing with edge cases you can't always anticipate. Not every "image" entry is an image — some are YouTube videos. The API returns a single object for one date, but an array for a range. Little things like that teach you to read docs carefully and write defensive code.
>
> AI was a huge accelerator here. I used it to plan my architecture before writing a single line, which meant I wasn't refactoring halfway through. It also helped me think through accessibility (keyboard navigation, ARIA attributes) that I might have skipped under deadline pressure.
>
> The thing I'm most proud of? The whole app runs with zero dependencies — just HTML, CSS, and vanilla JavaScript. Sometimes the simplest stack is the right one.
>
> 🔭 Check it out: [YOUR_GITHUB_PAGES_LINK]
> #WebDevelopment #NASA #JavaScript #API #BuildInPublic

---

## 12. Checklist Before Submission

- [ ] Site is deployed and accessible at GitHub Pages URL (not repo URL)
- [ ] Tested in incognito/private browser window
- [ ] Date range of at least 9 days works and shows 9 cards
- [ ] Each card has image, title, date
- [ ] Clicking any card opens modal with image, title, date, explanation
- [ ] Modal closes via X, overlay click, and Escape key
- [ ] Video entries in the gallery show a play icon and open an iframe or link in modal
- [ ] Random space fact updates on each page refresh
- [ ] Gallery images have smooth hover zoom
- [ ] Page uses NASA blue `#0B3D91` and NASA red `#FC3D21`
- [ ] Loading spinner shows before gallery loads
- [ ] No JavaScript errors in DevTools Console
- [ ] Reflection questions answered in submission doc
