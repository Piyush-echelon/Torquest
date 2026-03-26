# TorrHunt Linux Build Guide

## 🐧 Building .deb Package

### Option 1: Using WSL2 (Recommended for Windows)

**1. Install WSL2:**
```powershell
# In PowerShell (Admin)
wsl --install
```

**2. Open Ubuntu WSL:**
```bash
# Navigate to project
cd /mnt/c/Piyush/Projects/Antigravity/torrhunt

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Build .deb package
npm run build:linux
```

**3. Output:**
```bash
dist/torrhunt_1.0.0_amd64.deb
```

### Option 2: Using Docker (Windows/Mac)

**1. Install Docker Desktop**

**2. Run build:**
```bash
# Windows
build-docker.bat

# macOS/Linux
docker build -t torrhunt-builder .
docker run --rm -v $(pwd)/dist:/app/dist torrhunt-builder
```

### Option 3: Native Linux

**Ubuntu/Debian:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Build
npm run build:linux
```

### Option 4: GitHub Actions (CI/CD)

Create `.github/workflows/build-linux.yml`:

```yaml
name: Build Linux

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build .deb
      run: npm run build:linux
    
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: torrhunt-deb
        path: dist/*.deb
```

## 📦 Installation

### Ubuntu/Debian

```bash
# Method 1: dpkg
sudo dpkg -i dist/torrhunt_*.deb
sudo apt-get install -f

# Method 2: gdebi (recommended)
sudo apt-get install gdebi-core
sudo gdebi dist/torrhunt_*.deb
```

### Fedora/RHEL

```bash
# Convert .deb to .rpm
sudo dnf install alien
sudo alien -r dist/torrhunt_*.deb

# Install
sudo dnf install torrhunt-1.0.0*.rpm
```

### Arch Linux

```bash
# Use AUR helper or convert
yay -S torrhunt
```

## 🚀 Running

After installation:

1. **Applications Menu** → Search "TorrHunt"
2. **Terminal:** `torrhunt`
3. **Magnet Links:** Auto-opens TorrHunt

## 📋 Package Info

- **Package:** torrhunt_1.0.0_amd64.deb
- **Install Size:** ~150 MB
- **Location:** /opt/TorrHunt/
- **Desktop:** /usr/share/applications/torrhunt.desktop
- **Icon:** /usr/share/icons/hicolor/0x0/apps/torrhunt.png

## 🔧 Troubleshooting

### "fpm not found"
Build on Linux or use Docker/WSL2

### "Permission denied"
```bash
sudo chmod +x dist/*.deb
```

### App won't start
```bash
# Check installation
which torrhunt

# Run directly
/opt/TorrHunt/torrhunt

# Check logs
journalctl -f | grep torrhunt
```

### Missing dependencies
```bash
sudo apt-get install -f
```

## 📤 Distribution

### GitHub Releases

```bash
# Create release
gh release create v1.0.0 dist/*.deb --title "TorrHunt v1.0.0"
```

### PPA (Ubuntu)

```bash
# Install debhelper
sudo apt-get install debhelper

# Build source package
debuild -S -sa

# Upload to Launchpad
dput ppa:your-ppa/torrhunt dist/*.changes
```

## 🎯 Quick Build (WSL2)

```bash
# 1. Open WSL2 terminal
wsl

# 2. Navigate to project
cd /mnt/c/Piyush/Projects/Antigravity/torrhunt

# 3. Install and build
npm install
npm run build:linux

# 4. Install
sudo dpkg -i dist/torrhunt_*.deb

# 5. Run
torrhunt
```

Done! 🎉
