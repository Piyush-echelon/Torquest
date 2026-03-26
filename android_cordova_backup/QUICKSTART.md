# TorrHunt Android - Quick Start Guide

## 🚀 3 Ways to Build

### Method 1: Easiest - Cloud Build (No Setup)

1. **Copy your `icon.png`** to:
   - `android/res/icon/android/mipmap-hdpi/ic_launcher.png`

2. **Upload to cloud build service:**
   - Visit: https://build.phonegap.com (or similar service)
   - Upload the entire `android` folder
   - Wait for build to complete (~5 minutes)
   - Download APK

3. **Install on your phone:**
   - Transfer APK to your Android device
   - Enable "Install from Unknown Sources"
   - Install and enjoy!

### Method 2: Local Build (Fast Iteration)

```bash
# Prerequisites: Node.js, Java JDK, Android Studio

cd android
npm install
cordova platform add android
cordova build android
cordova run android
```

### Method 3: Test in Browser First

```bash
cd android/www
# Open index.html in Chrome/Firefox
# Use DevTools mobile emulation
```

## 📱 App Features

### Home Screen (Search)
- **Search Bar** - Type to search torrents
- **Category Pills** - Filter by type (scroll horizontally)
- **Results** - Tap any torrent for details
- **Bottom Sheet** - Swipe up to see full details

### Navigation
- **Search Tab** (left) - Main search interface
- **Settings Tab** (right) - App settings and info

### Torrent Details
- **Tap any result** - Opens bottom sheet
- **Open Magnet** - Launches your torrent app
- **Copy Link** - Copies magnet to clipboard

## 🎨 Customization

### Change App Icon
1. Replace `res/icon/android/mipmap-hdpi/ic_launcher.png` with your icon
2. Rebuild app

### Change App Name
Edit `config.xml`:
```xml
<name>Your App Name</name>
```

### Change Colors
Edit `www/styles.css`:
```css
:root {
  --accent: #6B82FF;  /* Primary color */
  --bg: #0a0a0f;       /* Background */
}
```

## 📊 API Sources

The app searches these sources automatically:
- ✅ ThePirateBay (All categories)
- ✅ YTS (Movies)
- ✅ EZTV (TV Shows)
- ✅ TorrentGalaxy (HD content)
- ✅ LimeTorrents (General)

## 🔧 Common Issues

### "No internet" error
- Check if you have WiFi/data enabled
- App requires internet to search torrents

### "Build failed" error
- Make sure you're in the `android` folder
- Run `npm install` first
- Check Java and Android SDK are installed

### App crashes on open
- Delete and reinstall
- Check Android version (requires 5.1+)

## 📱 Screenshot

The app looks like this:

```
┌─────────────────────────┐
│  ⚡ TorrHunt      ⚙️    │ ← Header
├─────────────────────────┤
│ [🔍 Search torrents...] │ ← Search bar
│ [🔍 Search        ]     │
├─────────────────────────┤
│ 🌐All 🎬Movies 📺TV...  │ ← Categories
├─────────────────────────┤
│                         │
│  ┌──────────────────┐  │
│  │ Torrent Title    │  │ ← Results
│  │ 📊 1.5GB 👤 2d   │  │
│  │ ▲ 150 ▼ 20       │  │
│  └──────────────────┘  │
│                         │
├─────────────────────────┤
│  🔍 Search  ⚙️ Settings │ ← Bottom Nav
└─────────────────────────┘
```

## 🎯 Next Steps

1. **Test the app** - Search for something
2. **Customize** - Add your icon, change colors
3. **Build APK** - Use cloud build or local
4. **Share** - Install on your device!

## 📞 Need Help?

- Check `README.md` for detailed docs
- Review `config.xml` for settings
- Inspect `www/app.js` for API logic

Happy torrenting! 🚀
