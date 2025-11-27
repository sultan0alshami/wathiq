# Multi-stage build for React frontend + Node.js backend
FROM node:20-bullseye AS frontend-builder

# Build the React frontend
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./

# Set environment variables for Vite build
# Use build arguments that Render will pass
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Production stage
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
    fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev

# Copy backend source (excluding node_modules)
COPY backend/server.js ./
COPY backend/generate_pdf.py ./
COPY backend/assets/ ./assets/
COPY backend/fonts/ ./fonts/

# Python deps for WeasyPrint
RUN pip3 install --no-cache-dir weasyprint==60.2 pydyf==0.10.0

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./public

# Set port
ENV PORT=8080

CMD ["node", "server.js"]
