# Root-level Dockerfile to build and run the backend service
FROM node:20-bullseye

# Install Python 3 and WeasyPrint dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    libcairo2 \
    pango1.0-tools libpango-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    libfontconfig1 \
    fonts-dejavu-core \
    fonts-amiri \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies (leverage caching)
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/. .

# Python deps for WeasyPrint
RUN pip3 install --no-cache-dir weasyprint==61.2

# Cloud Run/Koyeb default port
ENV PORT=8080

CMD ["npm", "start"]
