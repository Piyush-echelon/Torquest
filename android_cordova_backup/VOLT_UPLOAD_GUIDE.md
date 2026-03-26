# ⚡ Volt Build - Complete Upload Guide

## 📦 Files to Upload to Volt Build

### **Required Files (MUST Upload):**

```
android/
├── capacitor.config.json     ✅ REQUIRED
├── volt.config.json          ✅ REQUIRED
├── ionic.config.json         ✅ REQUIRED
├── angular.json              ✅ REQUIRED
├── package.json              ✅ REQUIRED
├── tsconfig.json             ✅ REQUIRED
├── tsconfig.app.json         ✅ REQUIRED
├── karma.conf.js             ✅ REQUIRED
├── www/                      ✅ REQUIRED (folder)
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── icon.png
└── res/                      ✅ REQUIRED (folder)
    └── icon/android/
        └── mipmap-hdpi/ic_launcher.png
```

### **Optional Files:**

```
├── README.md                 ℹ️ Reference only
├── VOLT_BUILD_GUIDE.md      ℹ️ Reference only
├── QUICKSTART.md            ℹ️ Reference only
├── tsconfig.spec.json       ℹ️ For testing
└── build.bat                ℹ️ Local build only
```

## 🚀 Step-by-Step Volt Build Process

### **Step 1: Prepare Files**

```bash
cd C:\Piyush\Projects\Antigravity\torrhunt\android

# Make sure www folder has all files
# Check these exist:
# - www/index.html
# - www/styles.css
# - www/app.js
# - www/icon.png
```

### **Step 2: Go to Volt Build**

1. Open: **https://volt.build** (or your Volt provider URL)
2. **Sign in** or **Create account**
3. Click **"New Project"** or **"Create App"**

### **Step 3: Upload Files**

**Option A: Upload ZIP (Recommended)**

1. **Create ZIP** of these files:
   ```
   - capacitor.config.json
   - volt.config.json
   - ionic.config.json
   - angular.json
   - package.json
   - tsconfig.json
   - www/ (entire folder)
   - res/ (entire folder)
   ```

2. **Upload ZIP** to Volt Build

3. **Extract** on Volt platform

**Option B: Git Repository**

1. Push code to GitHub/GitLab
2. Connect repository to Volt
3. Select the `android` folder as root

### **Step 4: Configure App**

In Volt dashboard, set:

```
App Name: TorrHunt
App ID: com.torrhunt.app
Version: 1.0.0
Package Name: com.torrhunt.app

Platform: Android
Min SDK: 22
Target SDK: 33

Orientation: Portrait
```

### **Step 5: Build Settings**

```
Build Type: APK
Architecture: arm64-v8a, armeabi-v7a
Debug Mode: Enabled (for testing)

Signing: 
- Auto-generate (for testing)
- Custom keystore (for release)
```

### **Step 6: Start Build**

1. Click **"Build Now"** or **"Start Build"**
2. Wait 3-5 minutes
3. Download APK when ready

### **Step 7: Install**

1. **Download APK** from Volt dashboard
2. **Transfer to Android device**
3. **Enable "Unknown Sources"** in Settings
4. **Install APK**
5. **Open TorrHunt!** 🎉

## ⚙️ Configuration Reference

### capacitor.config.json
```json
{
  "appId": "com.torrhunt.app",
  "appName": "TorrHunt",
  "webDir": "www",
  "android": {
    "allowMixedContent": true
  }
}
```

### volt.config.json
```json
{
  "volt": {
    "name": "TorrHunt",
    "appId": "com.torrhunt.app",
    "platform": "android",
    "minSdkVersion": 22,
    "targetSdkVersion": 33
  }
}
```

### package.json
Make sure these are present:
```json
{
  "dependencies": {
    "@capacitor/core": "^5.5.1",
    "@capacitor/android": "^5.5.1"
  },
  "devDependencies": {
    "@capacitor/cli": "^5.5.1"
  }
}
```

## 🎨 App Icon Requirements

**Upload your icon to:**
```
res/icon/android/mipmap-hdpi/ic_launcher.png
```

**Required size:** 72x72 pixels (minimum)
**Recommended:** 192x192 for xxxhdpi

**Format:** PNG with transparency

## 🐛 Troubleshooting

### Build Failed: "www folder not found"
**Solution:** Make sure `www/` folder is in your upload

### Build Failed: "Invalid capacitor.config.json"
**Solution:** Check JSON syntax, no trailing commas

### App Crashes on Open
**Solution:** 
- Check App ID matches in all config files
- Verify minSdkVersion is 22 or higher

### Icon Not Showing
**Solution:** 
- Place icon in `res/icon/android/mipmap-hdpi/`
- Name it exactly `ic_launcher.png`

### Build Takes Too Long
**Solution:** 
- Normal build time is 3-5 minutes
- If >10 min, check Volt status page

## 📊 Build Status

In Volt dashboard, you'll see:
- ⏳ **Queued** - Waiting to build
- 🔨 **Building** - In progress
- ✅ **Success** - Ready to download
- ❌ **Failed** - Check error logs

## 🔐 Signing for Release

For Google Play Store:

1. **Create Keystore:**
```bash
keytool -genkey -v -keystore torrhunt-release.keystore -alias torrhunt -keyalg RSA -keysize 2048 -validity 10000
```

2. **Upload to Volt:**
   - Go to Signing section
   - Upload keystore file
   - Enter password

3. **Build Release APK**

## 📱 Test Before Publishing

1. **Download Debug APK** from Volt
2. **Install on multiple devices**
3. **Test all features:**
   - Search torrents
   - View details
   - Open magnet links
   - Copy magnets
   - Navigate settings

4. **Fix any issues**
5. **Build Release APK**
6. **Publish to Google Play**

## 📞 Volt Build Support

If you encounter issues:

1. **Check Volt documentation**
2. **Review build logs** in dashboard
3. **Verify all config files**
4. **Contact Volt support**

## ✅ Pre-Upload Checklist

Before uploading to Volt:

- [ ] `capacitor.config.json` exists and is valid
- [ ] `volt.config.json` exists and is valid
- [ ] `package.json` has Capacitor dependencies
- [ ] `www/` folder contains all web files
- [ ] `www/index.html` loads without errors
- [ ] App icon is in `res/icon/android/`
- [ ] All JSON files have no syntax errors
- [ ] App ID is unique (com.torrhunt.app)
- [ ] App name is set (TorrHunt)

## 🎯 Quick Start (5 Minutes)

1. **Zip the android folder** (or just required files)
2. **Upload to Volt Build**
3. **Configure app name and ID**
4. **Click Build**
5. **Download APK**
6. **Install and test!**

That's it! Your TorrHunt Android app will be ready in minutes! 🚀

---

**Need help?** Check `VOLT_BUILD_GUIDE.md` for detailed documentation.
