# Use official Node 20 base (includes global fetch API)
FROM node:20-bullseye

# Install Python 3 and WeasyPrint dependencies
# WeasyPrint needs: python3, pip, libcairo2, pango, gdk-pixbuf, libffi, libpango, libfontconfig
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    libcairo2 \
    pango1.0-tools libpango-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    libfontconfig1 \
    fonts-dejavu-core \
    fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install backend dependencies first (leverage caching)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy the rest of the backend code
COPY . .

# Python deps for WeasyPrint
# If generate_pdf.py uses WeasyPrint directly, install it here
RUN pip3 install --no-cache-dir weasyprint==61.2

# Expose the port (Cloud Run provides $PORT)
ENV PORT=8080

# Start server
CMD ["npm", "start"]
