# Torquest Linux Build
FROM electronuserland/builder:wine-chrome

WORKDIR /app

# Copy project files
COPY package.json ./
COPY main.js ./
COPY preload.js ./
COPY index.html ./
COPY styles.css ./
COPY renderer.js ./
COPY icon.png ./
COPY build/ ./build/

# Install dependencies
RUN npm install

# Build for Linux
RUN npm run build:linux

# Show output
CMD ["ls", "-lh", "dist/"]
