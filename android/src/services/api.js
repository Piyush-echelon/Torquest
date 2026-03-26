const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

// Timeout helper
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { ...HEADERS, ...options.headers }
    });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

export const formatSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '—';
  if (bytes >= 1024 ** 4) return `${(bytes / (1024 ** 4)).toFixed(2)} TB`;
  if (bytes >= 1024 ** 3) return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / (1024 ** 2)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(2)} KB`;
};

export const buildMagnet = (infoHash, name) => {
  const trackers = [
    'udp://tracker.opentrackr.org:1337/announce',
    'udp://open.tracker.cl:1337/announce',
    'udp://tracker.leechers-paradise.org:6969/announce'
  ];
  const trackersStr = trackers.map(t => `&tr=${encodeURIComponent(t)}`).join('');
  return `magnet:?xt=urn:btih:${infoHash.toUpperCase()}&dn=${encodeURIComponent(name)}${trackersStr}`;
};

export const searchTorrents = async (query, category) => {
  // Execute all searches in parallel, but handle individual failures
  const searchPromises = [
    searchPirateBay(query, category),
    searchYTS(query),
    searchEZTV(query),
    searchSolidTorrents(query),
    search1337x(query),
  ];

  const resultsArray = await Promise.all(
    searchPromises.map(p => p.catch(e => {
      console.warn('Source search failed:', e.message);
      return [];
    }))
  );

  const allResults = resultsArray.flat();
  allResults.sort((a, b) => b.seeders - a.seeders);

  const seen = new Set();
  return allResults.filter((t) => {
    if (!t.info_hash) return true;
    const hash = t.info_hash.toLowerCase();
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  }).slice(0, 100);
};

const searchPirateBay = async (query, category) => {
  const catCodes = { all: '0', movies: '200', tv: '205', music: '100', games: '400', software: '300', ebooks: '601' };
  const url = `https://apibay.org/q.php?q=${encodeURIComponent(query)}&cat=${catCodes[category] || '0'}`;
  try {
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter((t) => t.info_hash && t.info_hash !== '0000000000000000000000000000000000000000')
      .map((t) => ({
        id: `pb-${t.id}`,
        title: t.name,
        info_hash: t.info_hash.toUpperCase(),
        magnet: buildMagnet(t.info_hash, t.name),
        size: parseInt(t.size) || 0,
        size_str: formatSize(parseInt(t.size) || 0),
        seeders: parseInt(t.seeders) || 0,
        leechers: parseInt(t.leechers) || 0,
        added: t.added,
        category: category,
        source: 'PirateBay',
      }));
  } catch (e) { return []; }
};

const searchYTS = async (query) => {
  const mirrors = ['https://yts.mx', 'https://yts.pm', 'https://yts.lt'];
  for (const mirror of mirrors) {
    try {
      const url = `${mirror}/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&limit=20`;
      const response = await fetchWithTimeout(url);
      const data = await response.json();
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
            });
          }
        }
        return results;
      }
    } catch (e) {}
  }
  return [];
};

const searchEZTV = async (query) => {
  const mirrors = ['https://eztv.wf', 'https://eztv.re', 'https://eztv.tf'];
  for (const mirror of mirrors) {
    try {
      const url = `${mirror}/api/get-torrents?limit=50&keywords=${encodeURIComponent(query)}`;
      const response = await fetchWithTimeout(url);
      const data = await response.json();
      if (data && data.torrents) {
        return data.torrents.map((t) => ({
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
    } catch (e) {}
  }
  return [];
};

const searchSolidTorrents = async (query) => {
  const url = `https://solidtorrents.to/api/v1/search?q=${encodeURIComponent(query)}&category=all&sort=seeders`;
  try {
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    if (!data || !data.success || !data.results) return [];
    return data.results.map((t) => ({
      id: `solid-${t.id}`,
      title: t.title,
      info_hash: t.infohash.toUpperCase(),
      magnet: buildMagnet(t.infohash, t.title),
      size: t.size || 0,
      size_str: formatSize(t.size || 0),
      seeders: t.seeders || 0,
      leechers: t.leechers || 0,
      added: t.createdAt || '',
      category: 'General',
      source: 'SolidTorrents',
    }));
  } catch (e) { return []; }
};

const search1337x = async (query) => {
  const url = `https://api.1337x.to/search/${encodeURIComponent(query)}/1/`;
  try {
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map((t) => ({
      id: `1337x-${t.id || Math.random()}`,
      title: t.name || t.title,
      info_hash: t.info_hash?.toUpperCase() || '',
      magnet: t.magnet || buildMagnet(t.info_hash, t.name),
      size: t.size || 0,
      size_str: formatSize(t.size || 0),
      seeders: t.seeders || 0,
      leechers: t.leechers || 0,
      added: t.added || '',
      category: t.category || 'General',
      source: '1337x',
    }));
  } catch (e) { return []; }
};
