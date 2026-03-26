# TorrHunt Android - Build Instructions

## 📱 Overview

TorrHunt Mobile is an Android app built with Apache Cordova that provides a mobile-optimized interface for searching torrents across multiple sources.

## 📋 Prerequisites

### For Local Build:
1. **Node.js** (v16 or higher)
2. **Java JDK** (v11 or higher)
3. **Android Studio** with:
   - Android SDK
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
4. **Apache Cordova CLI**

### For Cloud Build (Recommended):
1. **Adobe PhoneGap Build** account OR
2. **Cordova Cloud Build** service

## 🚀 Quick Start

### Option 1: Local Build

```bash
# Navigate to android folder
cd android

# Install dependencies
npm install

# Add Android platform (if not already added)
cordova platform add android

# Build APK
cordova build android

# Run on connected device
cordova run android

# Build release APK
cordova build android --release
```

### Option 2: Cloud Build (No Setup Required)

1. **Prepare build files:**
```bash
cd android
npm install
cordova prepare
```

2. **Upload to cloud build service:**
   - Go to your preferred Cordova cloud build service
   - Upload the entire `android` folder
   - Configure app settings (name, version, etc.)
   - Click "Build"

3. **Download APK:**
   - Once build completes, download the APK
   - Install on your Android device

## 📁 Project Structure

```
android/
├── config.xml          # Cordova configuration
├── package.json        # Dependencies
├── www/                # Web assets
│   ├── index.html      # Main HTML
│   ├── styles.css      # Mobile styles
│   └── app.js          # App logic
├── res/                # Resources (icons, splash screens)
│   ├── icon/           # App icons
│   └── screen/         # Splash screens
└── platforms/          # Platform-specific files (generated)
    └── android/
```

## 🔧 Configuration

### App Settings (config.xml)

Edit these values in `config.xml`:

```xml
<widget id="com.torrhunt.app" version="1.0.0">
    <name>TorrHunt</name>
    <description>Your description here</description>
    <author email="your@email.com" href="https://yourwebsite.com">
        Your Name
    </author>
</widget>
```

### Icons & Splash Screens

Place your images in:
- `res/icon/android/` - App icons (various sizes)
- `res/screen/android/` - Splash screens (various sizes)

Required icon sizes:
- `mipmap-ldpi/ic_launcher.png` (36x36)
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

## 📱 Features

### Mobile Optimizations:
- ✅ Touch-friendly UI with large tap targets
- ✅ Bottom navigation for easy thumb access
- ✅ Responsive search bar with voice input support
- ✅ Swipe gestures for navigation
- ✅ Offline detection
- ✅ Bottom sheet for torrent details
- ✅ Toast notifications
- ✅ Status bar integration

### Torrent Sources:
- ThePirateBay (API)
- YTS (Movies API)
- EZTV (TV Shows API)
- TorrentGalaxy (API)
- LimeTorrents (API)

### Cordova Plugins:
- `cordova-plugin-device` - Device information
- `cordova-plugin-network-information` - Online/offline detection
- `cordova-plugin-clipboard` - Copy magnet links
- `cordova-plugin-inappbrowser` - Open magnet links
- `cordova-plugin-statusbar` - Status bar customization
- `cordova-plugin-splashscreen` - Splash screen

## 🛠️ Build Commands

```bash
# Install dependencies
npm install

# Add platform
cordova platform add android

# Prepare web assets
cordova prepare

# Build debug APK
cordova build android

# Build release APK (for publishing)
cordova build android --release

# Run on device
cordova run android

# Run on emulator
cordova emulate android

# View logs
cordova log android
```

## 📤 Publishing to Google Play

1. **Create keystore:**
```bash
keytool -genkey -v -keystore torrhunt.keystore -alias torrhunt -keyalg RSA -keysize 2048 -validity 10000
```

2. **Build signed APK:**
   - Place keystore in `android/` folder
   - Create `build.json`:
```json
{
  "android": {
    "release": {
      "keystore": "torrhunt.keystore",
      "storePassword": "your-password",
      "alias": "torrhunt",
      "password": "your-password"
    }
  }
}
```
   - Build: `cordova build android --release -- --keystore=torrhunt.keystore`

3. **Upload to Google Play Console**

## 🐛 Troubleshooting

### Build Errors

**"SDK not found":**
```bash
export ANDROID_HOME=/path/to/android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**"Java not found":**
```bash
export JAVA_HOME=/path/to/java
export PATH=$PATH:$JAVA_HOME/bin
```

### Runtime Issues

**App crashes on startup:**
- Check `config.xml` for syntax errors
- Ensure all plugins are installed
- Check Android console logs: `cordova log android`

**API not working:**
- Check internet permission in `config.xml`
- Verify API endpoints are accessible
- Check network status in app

## 📝 Notes

- Minimum Android version: 5.1 (API 22)
- Target Android version: 13 (API 33)
- App size: ~5-10MB (depending on assets)

## 📄 License

MIT License - See main project LICENSE

## 🙏 Support

For issues or questions, please open an issue on the main repository.
