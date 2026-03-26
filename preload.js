const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  searchTorrents: (query, category) => ipcRenderer.invoke('search-torrents', { query, category }),
  openMagnet: (magnet) => ipcRenderer.invoke('open-magnet', magnet),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  startDownload: (magnet, title) => ipcRenderer.invoke('start-download', { magnet, title }),
  getDownloads: () => ipcRenderer.invoke('get-downloads'),
  removeDownload: (id) => ipcRenderer.invoke('remove-download', id),
  pauseDownload: (id) => ipcRenderer.invoke('pause-download', id),
  resumeDownload: (id) => ipcRenderer.invoke('resume-download', id),
  openDownloadFolder: () => ipcRenderer.invoke('open-download-folder'),
});

console.log('Preload script loaded successfully');
