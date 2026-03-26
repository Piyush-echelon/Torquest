const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

let mainWindow;
let wtClient;
let activeDownloads = new Map();

async function initWebTorrent() {
  const { default: WebTorrent } = await import('webtorrent');
  wtClient = new WebTorrent();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#00000000', // Transparent for vibrancy
    transparent: process.platform === 'darwin',
    titleBarStyle: 'hiddenInset',
    vibrancy: 'sidebar',
    trafficLightPosition: { x: 12, y: 12 },
    autoHideMenuBar: true,
  });

  Menu.setApplicationMenu(null);

  if (process.platform === 'win32') {
    mainWindow.setIcon(path.join(__dirname, 'icon.png'));
  }

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await initWebTorrent();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ============ DIRECT API CALLS ============
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json,*/*;q=0.8',
};

const TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.tracker.cl:1337/announce',
];

function buildMagnet(infoHash, name) {
  const trackers = TRACKERS.map(t => `&tr=${encodeURIComponent(t)}`).join('');
  return `magnet:?xt=urn:btih:${infoHash.toUpperCase()}&dn=${encodeURIComponent(name)}${trackers}`;
}

function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return 'Unknown';
  if (bytes >= 1024 ** 4) return `${(bytes / (1024 ** 4)).toFixed(2)} TB`;
  if (bytes >= 1024 ** 3) return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / (1024 ** 2)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

// 1. Pirate Bay API (via apibay.org) - MOST RELIABLE
async function searchPirateBay(query, category) {
  const catCodes = { all: '0', movies: '200', tv: '205', music: '100', games: '400', software: '300', ebooks: '601', anime: '200' };
  const url = `https://apibay.org/q.php?q=${encodeURIComponent(query)}&cat=${catCodes[category] || '0'}`;
  
  console.log('Searching PirateBay:', url);
  
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    console.log('PirateBay response:', Array.isArray(data) ? data.length : 'not array', data);
    
    if (!Array.isArray(data)) return [];
    
    return data
      .filter(t => t.info_hash && t.info_hash !== '0000000000000000000000000000000000000000')
      .map(t => ({
        id: `pb-${t.id}`,
        title: t.name,
        info_hash: t.info_hash.toUpperCase(),
        magnet: buildMagnet(t.info_hash, t.name),
        size: parseInt(t.size) || 0,
        size_str: formatSize(parseInt(t.size) || 0),
        seeders: parseInt(t.seeders) || 0,
        leechers: parseInt(t.leechers) || 0,
        added: t.added,
        category: t.type,
        source: 'ThePirateBay',
      }));
  } catch (e) {
    console.error('PirateBay error:', e.message);
    return [];
  }
}

// 2. YTS API (Movies) - RELIABLE
async function searchYTS(query) {
  // Try multiple mirrors if primary fails
  const mirrors = ['https://yts.mx', 'https://yts.pm', 'https://yts.lt'];
  
  for (const mirror of mirrors) {
    const url = `${mirror}/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&limit=20`;
    console.log('Searching YTS:', url);
    
    try {
      const { data } = await axios.get(url, { headers: HEADERS, timeout: 8000 });
      if (data.status === 'ok' && data.data?.movies) {
        const results = [];
        for (const movie of data.data.movies) {
          for (const torrent of movie.torrents || []) {
            const title = `${movie.title_long} [${torrent.quality}]`;
            results.push({
              id: `yts-${movie.id}-${torrent.quality}`,
              title,
              info_hash: torrent.hash.toUpperCase(),
              magnet: buildMagnet(torrent.hash, title),
              size: torrent.size_bytes,
              size_str: formatSize(torrent.size_bytes),
              seeders: torrent.seeds,
              leechers: torrent.peers,
              added: torrent.date_uploaded,
              category: 'Movies',
              source: 'YTS',
              imdb: movie.imdb_code,
            });
          }
        }
        return results;
      }
    } catch (e) {
      console.warn(`YTS mirror ${mirror} failed:`, e.message);
    }
  }
  return [];
}

// 3. EZTV API (TV Shows)
async function searchEZTV(query) {
  const mirrors = ['https://eztv.wf', 'https://eztv.re', 'https://eztv.tf'];
  
  for (const mirror of mirrors) {
    const url = `${mirror}/api/get-torrents?limit=50&keywords=${encodeURIComponent(query)}`;
    console.log('Searching EZTV:', url);
    
    try {
      const { data } = await axios.get(url, { headers: HEADERS, timeout: 8000 });
      if (data && data.torrents) {
        return data.torrents.map(t => ({
          id: `eztv-${t.id}`,
          title: t.title,
          info_hash: t.hash.toUpperCase(),
          magnet: t.magnet_url,
          size: typeof t.size_bytes === 'number' ? t.size_bytes : 0,
          size_str: formatSize(typeof t.size_bytes === 'number' ? t.size_bytes : 0),
          seeders: t.seeds || 0,
          leechers: t.peers || 0,
          added: String(t.date_released_unix || ''),
          category: 'TV',
          source: 'EZTV',
        }));
      }
    } catch (e) {
      console.warn(`EZTV mirror ${mirror} failed:`, e.message);
    }
  }
  return [];
}

// 4. SolidTorrents API - VERY RELIABLE
async function searchSolidTorrents(query) {
  const url = `https://solidtorrents.to/api/v1/search?q=${encodeURIComponent(query)}&category=all&sort=seeders`;
  
  console.log('Searching SolidTorrents:', url);
  
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    console.log('SolidTorrents response:', data.success ? data.results.length : 'failed');
    
    if (!data || !data.success || !data.results) return [];
    
    return data.results.map(t => ({
      id: `solid-${t.id}`,
      title: t.title,
      info_hash: t.infohash.toUpperCase(),
      magnet: buildMagnet(t.infohash, t.title),
      size: t.size || 0,
      size_str: formatSize(t.size || 0),
      seeders: t.seeders || 0,
      leechers: t.leechers || 0,
      added: t.createdAt || '',
      category: 'All',
      source: 'SolidTorrents',
    }));
  } catch (e) {
    console.error('SolidTorrents error:', e.message);
    return [];
  }
}

// 5. 1337x API (via proxy/mirror)
async function search1337x(query) {
  // Using a more stable mirror if possible, but 1337x usually needs scraping.
  // We'll try a common API proxy first.
  const url = `https://api.1337x.to/search/${encodeURIComponent(query)}/1/`;
  
  console.log('Searching 1337x:', url);
  
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    if (!Array.isArray(data)) return [];
    
    return data.map(t => ({
      id: `1337x-${t.id || Math.random()}`,
      title: t.name || t.title,
      info_hash: t.info_hash?.toUpperCase() || '',
      magnet: t.magnet || buildMagnet(t.info_hash, t.name),
      size: t.size || 0,
      size_str: formatSize(t.size || 0),
      seeders: t.seeders || 0,
      leechers: t.leechers || 0,
      added: t.added || '',
      category: t.category || 'All',
      source: '1337x',
    }));
  } catch (e) {
    console.error('1337x error:', e.message);
    return [];
  }
}

// IPC Handler for search
ipcMain.handle('search-torrents', async (event, { query, category }) => {
  console.log(`\n=== SEARCH START ===`);
  console.log(`Query: "${query}", Category: ${category}`);
  
  // Search all APIs concurrently (5 sources)
  const [pb, yts, eztv, solid, x1337] = await Promise.all([
    searchPirateBay(query, category),
    searchYTS(query),
    searchEZTV(query),
    searchSolidTorrents(query),
    search1337x(query),
  ]);
  
  console.log('\n=== RESULTS ===');
  console.log('PirateBay:', pb.length);
  console.log('YTS:', yts.length);
  console.log('EZTV:', eztv.length);
  console.log('SolidTorrents:', solid.length);
  console.log('1337x:', x1337.length);
  
  const sources = [
    ['ThePirateBay', pb],
    ['YTS', yts],
    ['EZTV', eztv],
    ['SolidTorrents', solid],
    ['1337x', x1337],
  ];
  
  const allResults = [];
  const sourcesUsed = [];
  const sourcesFailed = [];
  const seenHashes = new Set();
  
  for (const [name, results] of sources) {
    if (results.length === 0) {
      sourcesFailed.push(name);
    } else {
      sourcesUsed.push(name);
      for (const r of results) {
        if (r.info_hash && seenHashes.has(r.info_hash)) continue;
        if (r.info_hash) seenHashes.add(r.info_hash);
        allResults.push(r);
      }
    }
  }
  
  allResults.sort((a, b) => b.seeders - a.seeders);
  
  console.log('\n=== SEARCH END ===');
  console.log(`Total: ${allResults.length} results`);
  console.log(`Sources used: ${sourcesUsed.join(', ')}`);
  
  return {
    results: allResults,
    sources_used: sourcesUsed,
    sources_failed: sourcesFailed,
  };
});

// Open magnet link
ipcMain.handle('open-magnet', async (event, magnet) => {
  if (magnet && magnet.startsWith('magnet:')) {
    await shell.openExternal(magnet);
    return true;
  }
  return false;
});

// Copy to clipboard
ipcMain.handle('copy-to-clipboard', async (event, text) => {
  const { clipboard } = require('electron');
  clipboard.writeText(text);
  return true;
});

// ============ DOWNLOADER ============

function formatSpeed(bytes) {
  if (bytes === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatTime(ms) {
  if (ms === Infinity || isNaN(ms)) return 'Remaining: --';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));
  
  if (hours > 0) return `Remaining: ${hours}h ${minutes}m`;
  if (minutes > 0) return `Remaining: ${minutes}m ${seconds}s`;
  return `Remaining: ${seconds}s`;
}

ipcMain.handle('start-download', async (event, { magnet, title }) => {
  if (!wtClient) await initWebTorrent();
  if (!magnet || !magnet.startsWith('magnet:')) return { success: false, error: 'Invalid magnet link' };
  
  const downloadPath = path.join(app.getPath('downloads'), 'Torquest');
  if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath, { recursive: true });

  // Check if already downloading
  if (activeDownloads.has(magnet)) return { success: true, message: 'Already downloading' };

  try {
    const torrent = wtClient.add(magnet, { path: downloadPath });
    
    activeDownloads.set(magnet, {
      id: magnet,
      title: title || 'Unknown Torrent',
      torrent: torrent,
      addedAt: Date.now()
    });

    console.log(`Download started: ${title}`);
    return { success: true };
  } catch (err) {
    console.error('Download start error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-downloads', async () => {
  if (!wtClient) await initWebTorrent();
  const downloads = [];
  for (const [id, data] of activeDownloads.entries()) {
    const t = data.torrent;
    downloads.push({
      id: id,
      title: data.title,
      progress: (t.progress * 100).toFixed(1),
      downloadSpeed: formatSpeed(t.downloadSpeed),
      uploadSpeed: formatSpeed(t.uploadSpeed),
      timeRemaining: formatTime(t.timeRemaining),
      numPeers: t.numPeers,
      done: t.done,
      path: t.path,
      infoHash: t.infoHash,
      size: formatSize(t.length)
    });
  }
  return downloads;
});

ipcMain.handle('remove-download', async (event, magnet) => {
  if (!wtClient) await initWebTorrent();
  const data = activeDownloads.get(magnet);
  if (data) {
    data.torrent.pause();
    data.torrent.destroy();
    activeDownloads.delete(magnet);
    return true;
  }
  return false;
});

ipcMain.handle('open-download-folder', async (event) => {
  const downloadPath = path.join(app.getPath('downloads'), 'Torquest');
  if (fs.existsSync(downloadPath)) {
    shell.openPath(downloadPath);
  } else {
    shell.openPath(app.getPath('downloads'));
  }
  return true;
});
