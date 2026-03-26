// Torquest Renderer Process

// State
let selectedCategory = 'all';
let selectedTorrent = null;
let isDark = true;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const categories = document.getElementById('categories');
  const resultsContainer = document.getElementById('resultsContainer');
  const sourceBar = document.getElementById('sourceBar');
  const detailOverlay = document.getElementById('detailOverlay');
  const detailPanel = document.getElementById('detailPanel');
  const detailTitle = document.getElementById('detailTitle');
  const detailBody = document.getElementById('detailBody');
  const detailClose = document.getElementById('detailClose');
  const openMagnetBtn = document.getElementById('openMagnetBtn');
  const copyMagnetBtn = document.getElementById('copyMagnetBtn');
  const toastContainer = document.getElementById('toastContainer');
  const themeToggle = document.getElementById('themeToggle');
  const searchPage = document.getElementById('searchPage');
  const settingsPage = document.getElementById('settingsPage');
  const downloadsPage = document.getElementById('downloadsPage');
  const downloadsContainer = document.getElementById('downloadsContainer');
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const downloadBtn = document.getElementById('downloadBtn');
  const themeOpts = document.querySelectorAll('.theme-opt');

  let downloadsInterval = null;

  // Theme Management
  function applyTheme(themeName) {
    const isSystem = themeName === 'system';
    let effectiveTheme = themeName;

    if (isSystem) {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    isDark = effectiveTheme === 'dark';
    document.documentElement.classList.toggle('light-theme', !isDark);
    
    // Update active UI state
    themeOpts.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === themeName);
    });

    try {
      localStorage.setItem('torquest-theme-mode', themeName);
    } catch (e) {}
  }

  // Handle system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const savedMode = localStorage.getItem('torquest-theme-mode') || 'system';
    if (savedMode === 'system') applyTheme('system');
  });

  // Theme Toggle Button (Legacy support/Quick switch)
  themeToggle.addEventListener('click', () => {
    const nextTheme = isDark ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // Settings Theme Options
  themeOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      applyTheme(opt.dataset.theme);
    });
  });

  // Initial Theme Load
  try {
    const savedMode = localStorage.getItem('torquest-theme-mode') || 'system';
    applyTheme(savedMode);
  } catch (e) {
    applyTheme('dark');
  }

// Page Navigation
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    sidebarItems.forEach(i => i.classList.toggle('active', i === item));
    
    // Switch pages
    searchPage.style.display = page === 'search' ? 'flex' : 'none';
    settingsPage.style.display = page === 'settings' ? 'block' : 'none';
    downloadsPage.style.display = page === 'downloads' ? 'flex' : 'none';

    // Handle background tasks for pages
    if (page === 'downloads') {
      startDownloadsPolling();
    } else {
      stopDownloadsPolling();
    }
  });
});

// Category Selection
categories.addEventListener('click', (e) => {
  if (e.target.classList.contains('cat-btn')) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    selectedCategory = e.target.dataset.cat;
  }
});

// Search
async function doSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  // Clear previous
  resultsContainer.innerHTML = '';
  sourceBar.style.display = 'none';
  
  // Show loading
  resultsContainer.innerHTML = `
    <div class="spinner-wrap" style="height: 100%;">
      <div class="spinner"></div>
      <p style="color: var(--text-tertiary); font-size: 13px;">Searching sources...</p>
    </div>
  `;
  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching...';

  try {
    const result = await window.electronAPI.searchTorrents(query, selectedCategory);
    displayResults(result);
  } catch (err) {
    console.error('Search error:', err);
    showToast(`Search failed: ${err.message}`);
    resultsContainer.innerHTML = `
      <div class="spinner-wrap" style="height: 100%;">
        <div class="state-icon"><i class="fas fa-triangle-exclamation" style="color: var(--system-red);"></i></div>
        <p style="color: var(--text-tertiary); font-size: 13px;">${err.message}</p>
      </div>
    `;
  }

  searchBtn.disabled = false;
  searchBtn.textContent = 'Search';
}

searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') doSearch();
});

// Display Results
function displayResults(data) {
  const { results, sources_used, sources_failed } = data;

  // Source bar
  if (sources_used.length || sources_failed.length) {
    sourceBar.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center; padding: 4px 16px; font-size: 11px;">
        <span style="color: var(--text-tertiary);">Sources:</span>
        ${sources_used.map(s => `<span style="color: var(--system-green); font-weight: 600;">${s}</span>`).join('<span style="color: var(--border);">|</span>')}
        ${sources_failed.length ? `<span style="color: var(--system-red); opacity: 0.7;">(+${sources_failed.length} failed)</span>` : ''}
      </div>
    `;
    sourceBar.style.display = 'block';
  }

  // No results
  if (!results.length) {
    resultsContainer.innerHTML = `
      <div class="spinner-wrap" style="height: 100%;">
        <div class="state-icon"><i class="fas fa-magnifying-glass" style="opacity: 0.2; font-size: 48px;"></i></div>
        <p style="color: var(--text-tertiary); font-size: 13px;">No results found for your search.</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = '';

  // Result rows
  results.forEach((torrent, i) => {
    const row = document.createElement('div');
    row.className = 'torrent-row';
    row.innerHTML = `
      <div class="torrent-title" title="${escapeHtml(torrent.title)}">${escapeHtml(torrent.title)}</div>
      <span class="torrent-size">${torrent.size_str || '—'}</span>
      <span class="torrent-date">${formatDate(torrent.added)}</span>
      <span class="torrent-category">${torrent.category || '—'}</span>
      <span>
        <span class="seeders">${torrent.seeders.toLocaleString()}</span>
        <span style="color: var(--text-tertiary); margin: 0 4px;">/</span>
        <span class="leechers">${torrent.leechers.toLocaleString()}</span>
      </span>
      <span class="torrent-source-badge">${torrent.source}</span>
    `;

    row.addEventListener('click', () => showDetail(torrent));
    resultsContainer.appendChild(row);
  });

  showToast(`Found ${results.length} results from ${sources_used.length} sources`);
}

// Show Detail Panel
function showDetail(torrent) {
  selectedTorrent = torrent;
  detailTitle.textContent = torrent.title;

  detailBody.innerHTML = `
    <div class="detail-stats">
      <div class="stat-card">
        <div class="stat-label">Seeds</div>
        <div class="stat-value" style="color: var(--system-green)">${torrent.seeders.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Peers</div>
        <div class="stat-value" style="color: var(--system-red)">${torrent.leechers.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Size</div>
        <div class="stat-value">${torrent.size_str || '—'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Source</div>
        <div class="stat-value" style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${torrent.source}</div>
      </div>
    </div>
    
    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
      <div class="info-row">
        <span class="info-row-label">Category</span>
        <span class="info-row-value">${torrent.category || '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Added</span>
        <span class="info-row-value">${formatDate(torrent.added, true)}</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Hash</span>
        <span class="info-row-value" style="font-family: monospace; font-size: 10px;">${torrent.info_hash || '—'}</span>
      </div>
      ${torrent.imdb ? `
      <div class="info-row">
        <span class="info-row-label">IMDB</span>
        <span class="info-row-value">${torrent.imdb}</span>
      </div>
      ` : ''}
    </div>

    ${torrent.magnet ? `
    <div style="margin-top: 24px;">
      <div class="magnet-label">Magnet Link</div>
      <div class="magnet-box">${torrent.magnet}</div>
    </div>
    ` : ''}
  `;

  detailOverlay.style.display = 'flex';
}

// Close Detail Panel
function hideDetail() {
  detailOverlay.style.display = 'none';
  selectedTorrent = null;
}

detailClose.addEventListener('click', hideDetail);
detailOverlay.addEventListener('click', (e) => {
  if (e.target === detailOverlay) hideDetail();
});

// Download Action
downloadBtn.addEventListener('click', async () => {
  if (!selectedTorrent?.magnet) {
    showToast('No magnet link available');
    return;
  }
  
  const result = await window.electronAPI.startDownload(selectedTorrent.magnet, selectedTorrent.title);
  
  if (result.success) {
    showToast('Download started');
    hideDetail();
    
    // Switch to downloads page
    const downloadsTab = document.querySelector('.sidebar-item[data-page="downloads"]');
    if (downloadsTab) downloadsTab.click();
  } else {
    showToast(`Failed: ${result.error}`);
  }
});

// Downloads Polling & UI
function startDownloadsPolling() {
  updateDownloadsUI();
  if (downloadsInterval) clearInterval(downloadsInterval);
  downloadsInterval = setInterval(updateDownloadsUI, 2000);
}

function stopDownloadsPolling() {
  if (downloadsInterval) {
    clearInterval(downloadsInterval);
    downloadsInterval = null;
  }
}

async function updateDownloadsUI() {
  try {
    const downloads = await window.electronAPI.getDownloads();
    renderDownloads(downloads);
  } catch (err) {
    console.error('Failed to update downloads:', err);
  }
}

function renderDownloads(downloads) {
  if (!downloads || downloads.length === 0) {
    downloadsContainer.innerHTML = `
      <div class="spinner-wrap" style="height: 100%;">
        <div class="state-icon"><i class="fas fa-arrow-down" style="opacity: 0.2; font-size: 48px;"></i></div>
        <p style="color: var(--text-tertiary); font-size: 13px;">No active downloads</p>
      </div>
    `;
    return;
  }

  downloadsContainer.innerHTML = '';
  
  downloads.forEach(dl => {
    const card = document.createElement('div');
    card.className = `download-card ${dl.done ? 'completed' : ''} ${dl.paused ? 'paused' : ''}`;
    card.innerHTML = `
      <div class="download-info">
        <div class="download-title-wrap">
          <div class="download-title" title="${escapeHtml(dl.title)}">${escapeHtml(dl.title)}</div>
          <div class="download-meta">
            <span class="download-status-badge ${dl.done ? 'completed' : (dl.paused ? 'paused' : '')}">
              ${dl.done ? 'Finished' : (dl.paused ? 'Paused' : 'Downloading')}
            </span>
            <span>${dl.size}</span>
            <span>${dl.numPeers} peers</span>
            <span>${dl.done ? '' : dl.timeRemaining}</span>
          </div>
        </div>
        <div class="download-controls">
          ${!dl.done ? `
          <button class="control-btn" title="${dl.paused ? 'Resume' : 'Pause'}" onclick="window.togglePause('${dl.id}', ${dl.paused})">
            <i class="fas fa-${dl.paused ? 'play' : 'pause'}"></i>
          </button>
          ` : ''}
          <button class="control-btn" title="Open Folder" onclick="window.electronAPI.openDownloadFolder()">
            <i class="fas fa-folder-open"></i>
          </button>
          <button class="control-btn remove" title="Remove" onclick="window.removeDownload('${dl.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="download-progress-wrap">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${dl.progress}%; background: ${dl.done ? 'var(--system-green)' : (dl.paused ? 'var(--system-orange)' : 'var(--system-blue)')}"></div>
        </div>
        <div class="progress-stats">
          <span>${dl.progress}%</span>
          <span><i class="fas fa-arrow-down"></i> ${dl.downloadSpeed}</span>
        </div>
      </div>
    `;
    downloadsContainer.appendChild(card);
  });
}

// Global helpers for buttons (since we use onclick in template)
window.togglePause = async (id, isPaused) => {
  if (isPaused) {
    await window.electronAPI.resumeDownload(id);
  } else {
    await window.electronAPI.pauseDownload(id);
  }
  updateDownloadsUI();
};

window.removeDownload = async (id) => {
  if (confirm('Are you sure you want to remove this download?')) {
    await window.electronAPI.removeDownload(id);
    updateDownloadsUI();
  }
};

// Open Magnet
openMagnetBtn.addEventListener('click', async () => {
  if (!selectedTorrent?.magnet) {
    showToast('No magnet link available');
    return;
  }
  await window.electronAPI.openMagnet(selectedTorrent.magnet);
  showToast('Opening in torrent client...');
});

// Copy Magnet
copyMagnetBtn.addEventListener('click', async () => {
  if (!selectedTorrent?.magnet) {
    showToast('No magnet link available');
    return;
  }
  await window.electronAPI.copyToClipboard(selectedTorrent.magnet);
  showToast('Copied to clipboard');
});

// Toast
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Utilities
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr, detailed = false) {
  if (!dateStr) return '—';
  const num = parseInt(dateStr);
  if (!isNaN(num) && num > 1000000000) {
    const date = new Date(num * 1000);
    return detailed
      ? date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  }
  return dateStr;
}

// Focus search input on load
if (searchInput) searchInput.focus();

} // End of initApp
