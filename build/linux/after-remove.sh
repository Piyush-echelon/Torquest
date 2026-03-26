#!/bin/bash
# TorrHunt Debian Package - Post Remove Script

echo "Removing TorrHunt..."

# Remove desktop entry
rm -f /usr/share/applications/torrhunt.desktop

# Update desktop database
update-desktop-database /usr/share/applications 2>/dev/null || true

# Remove magnet link handler
xdg-mime default applications/default.desktop x-scheme-handler/magnet 2>/dev/null || true

echo "TorrHunt removed successfully!"
