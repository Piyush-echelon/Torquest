# Torquest v1.0.0

A modern, cross-platform torrent search application built with Electron.

![Electron](https://img.shields.io/badge/Electron-28-blue.svg)
![Node](https://img.shields.io/badge/Node-18+-green.svg)

## ✨ Features

- 🔍 **Multi-source Search** - Search across 7 torrent sources simultaneously
- 🎬 **Category Filtering** - Filter by Movies, TV, Music, Games, Software, Ebooks, Anime
- 🌓 **Dark/Light Theme** - Beautiful modern UI with theme support
- ⚡ **Fast & Responsive** - Async search with real-time results
- 🧲 **Magnet Support** - Open magnet links or copy to clipboard

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Run the application:**
```bash
npm start
```

Or for development mode with DevTools:
```bash
npm run dev
```

## 📊 Sources (20+ Providers!)

Powered by **torrent-search-api** - Automatically searches across 20+ torrent providers:

### Major Providers:
- **ThePirateBay** - Largest torrent index (20M+ torrents)
- **1337x** - Verified torrents, all categories
- **YTS** - HD Movies (720p/1080p/4K)
- **EZTV** - TV Shows
- **TorrentGalaxy** - HD content
- **Nyaa.si** - Anime & Asian content
- **MagnetDL** - General content
- **LimeTorrents** - General content
- **TorrentDownloads** - General content
- **KickassTorrents** - General content
- **And 10+ more providers!**

### ✅ Benefits:
- 🚀 **Searches 20+ providers simultaneously**
- ⚡ **Faster results** - Parallel API calls
- 🎯 **More content** - Access to 50M+ torrents
- 🔄 **Auto-failover** - If one provider fails, others still work
- 📈 **Better quality** - Find the best seeds across all sources

## 🛠️ Development

### Project Structure

```
torquest/
├── main.js         # Electron main process
├── preload.js      # Preload script (IPC bridge)
├── renderer.js     # Frontend JavaScript
├── index.html      # Main HTML file
├── styles.css      # Styles
├── package.json    # Dependencies & scripts
└── README.md       # This file
```

### Build (Optional)

To create a distributable executable:

```bash
npm run build
```

## 📝 License

MIT License - This project is for educational purposes only.

## ⚠️ Disclaimer

Torquest is a search interface only. It does not host any torrent files or content. Users are responsible for complying with their local copyright laws and should only download content they have the right to access.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Torrent data provided by various public APIs and scrapers
