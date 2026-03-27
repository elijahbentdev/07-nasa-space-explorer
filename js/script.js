// ─── NASA Space Explorer — script.js ───

// ── CONFIG ──────────────────────────────────────────────────────────────────
const API_KEY = 'p1Jxwj5yAe9MnPBoFyL0aEOXmeb1NO5ccTgu5MBq'; // Replace with your own NASA API key
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
