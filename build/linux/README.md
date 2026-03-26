# TorrHunt Linux Build Guide

## 📦 Building Debian Package (.deb)

### Prerequisites

**On Linux (Recommended):**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y nodejs npm fakeroot dpkg

# Install dependencies
npm install
```

**On Windows (Cross-compile):**
```bash
# Just need Node.js and npm
npm install
```

### Build Commands

**Build .deb package:**
```bash
npm run build:linux
```

**Build all Linux formats (deb + AppImage):**
```bash
npm run build:all
```

**Build for Windows and Linux:**
```bash
npm run build:all
```

### Output

After successful build, you'll find:
- `dist/torrhunt_1.0.0_amd64.deb` - Debian package
- `dist/torrhunt-1.0.0.AppImage` - AppImage (portable)

## 📥 Installation

### Debian/Ubuntu

```bash
# Install the package
sudo dpkg -i dist/torrhunt_*.deb

# Fix any missing dependencies
sudo apt-get install -f
```

### Install via GDebi (Recommended)

```bash
sudo apt-get install gdebi-core
sudo gdebi dist/torrhunt_*.deb
```

## 🚀 Usage

After installation:

1. **Applications Menu** → Search for "TorrHunt"
2. **Command Line**: `torrhunt`
3. **Magnet Links**: Automatically opens TorrHunt

## 📋 Package Details

- **Package Name:** torrhunt
- **Version:** 1.0.0
- **Architecture:** amd64
- **Install Location:** /opt/TorrHunt/
- **Desktop Entry:** /usr/share/applications/torrhunt.desktop
- **Magnet Handler:** Registered for magnet: links

## 🔧 Build Configuration

Edit `package.json` to customize:

```json
{
  "build": {
    "linux": {
      "target": ["deb", "AppImage"],
      "category": "Utility",
      "synopsis": "Multi-source Torrent Search Engine",
      "description": "Search torrents across multiple sources"
    },
    "deb": {
      "depends": ["gconf2", "gconf-service", "libnotify4"]
    }
  }
}
```

## 🐛 Troubleshooting

### "electron-builder not found"
```bash
npm install --save-dev electron-builder
```

### "Permission denied"
```bash
chmod +x build/linux/*.sh
```

### Build fails on Windows
Cross-compiling Linux packages from Windows may not work perfectly. For best results:
1. Use a Linux VM (VirtualBox with Ubuntu)
2. Use WSL2 (Windows Subsystem for Linux)
3. Use GitHub Actions for CI/CD builds

### App won't start after install
```bash
# Check if installed
which torrhunt

# Try running directly
/opt/TorrHunt/torrhunt

# Check logs
tail -f ~/.config/torrhunt/logs/main.log
```

## 📤 Publishing

### Upload to GitHub Releases

```bash
# Install GitHub CLI
gh release create v1.0.0 dist/*.deb --title "TorrHunt v1.0.0"
```

### Publish to Snap Store

```bash
# Install snapcraft
sudo snap install snapcraft --classic

# Build snap
snapcraft

# Upload
snapcraft upload torrhunt_*.snap --release stable
```

## 🎯 Quick Build (5 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Build
npm run build:linux

# 3. Install
sudo dpkg -i dist/torrhunt_*.deb

# 4. Run
torrhunt
```

That's it! Your TorrHunt Debian package is ready! 🎉

## 📞 Support

For issues:
- Check build logs in console
- Review electron-builder docs: https://www.electron.build/
- Open issue on GitHub
