#!/bin/bash
# TorrHunt Debian Build Script

echo "=========================================="
echo "  TorrHunt - Building Debian Package"
echo "=========================================="
echo ""

# Check if we're on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "⚠️  Warning: Building Linux package on non-Linux system"
    echo "   For best results, build on Ubuntu/Debian Linux"
    echo ""
fi

# Check dependencies
echo "Checking dependencies..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm found"

# Install dependencies
echo ""
echo "Installing npm dependencies..."
npm install

# Build the package
echo ""
echo "Building Debian package..."
npm run build:linux

# Check if build was successful
if [ -f "dist/torrhunt_*.deb" ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ Build Successful!"
    echo "=========================================="
    echo ""
    echo "Debian package created:"
    ls -lh dist/*.deb
    echo ""
    echo "To install:"
    echo "  sudo dpkg -i dist/torrhunt_*.deb"
    echo "  sudo apt-get install -f  # Fix dependencies if needed"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "  ❌ Build Failed"
    echo "=========================================="
    echo ""
    echo "Check the error messages above."
    echo "Make sure you have electron-builder installed:"
    echo "  npm install --save-dev electron-builder"
    echo ""
    exit 1
fi
