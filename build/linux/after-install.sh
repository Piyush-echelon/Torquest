#!/bin/bash
# TorrHunt Debian Package - Post Install Script

echo "Installing TorrHunt..."

# Create application menu entry
cat > /usr/share/applications/torrhunt.desktop << EOF
[Desktop Entry]
Name=TorrHunt
Comment=Multi-source Torrent Search Engine
Exec=/opt/TorrHunt/torrhunt %U
Icon=torrhunt
Type=Application
Categories=Utility;Network;
MimeType=x-scheme-handler/magnet;
Terminal=false
EOF

# Update desktop database
update-desktop-database /usr/share/applications 2>/dev/null || true

# Register magnet link handler
xdg-mime default torrhunt.desktop x-scheme-handler/magnet 2>/dev/null || true

echo "TorrHunt installed successfully!"
echo "You can find it in your Applications menu."
