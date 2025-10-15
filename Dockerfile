# Multi-stage build for React frontend + Node.js backend
FROM node:20-bullseye AS frontend-builder

# Build the React frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
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

# Copy backend source
COPY backend/. .

# Python deps for WeasyPrint
RUN pip3 install --no-cache-dir weasyprint==60.2 pydyf==0.10.0

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./public

# Set port
ENV PORT=8080

# Create a simple server that serves both frontend and backend
RUN echo 'const express = require("express");\n\
const cors = require("cors");\n\
const path = require("path");\n\
const { spawn } = require("child_process");\n\
const fs = require("fs").promises;\n\
const cron = require("node-cron");\n\
const { createClient } = require("@supabase/supabase-js");\n\
const fetch = require("node-fetch");\n\
\n\
const app = express();\n\
const port = process.env.PORT || 8080;\n\
\n\
// CORS configuration\n\
const corsOptions = {\n\
  origin: (origin, callback) => {\n\
    const allowedOrigins = [\n\
      "http://localhost:5173",\n\
      "http://localhost:8080",\n\
      "https://wathiq-7eby.onrender.com",\n\
      process.env.FRONTEND_URL,\n\
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,\n\
    ].filter(Boolean);\n\
    if (!origin || allowedOrigins.includes(origin)) {\n\
      callback(null, true);\n\
    } else {\n\
      console.warn(`CORS blocked origin: ${origin}`);\n\
      callback(new Error("Not allowed by CORS"));\n\
    }\n\
  },\n\
  methods: ["GET", "POST", "OPTIONS"],\n\
  allowedHeaders: ["Content-Type", "Authorization"],\n\
  optionsSuccessStatus: 200,\n\
};\n\
app.use(cors(corsOptions));\n\
app.use(express.json());\n\
\n\
// Serve static files from public directory\n\
app.use(express.static(path.join(__dirname, "public")));\n\
\n\
// API routes\n\
app.post("/api/generate-pdf", async (req, res) => {\n\
  console.log("Received request to generate PDF");\n\
  const { data, date } = req.body;\n\
\n\
  const pythonExecutable = process.env.PYTHON_PATH || (process.platform === "win32" ? "python" : "python3");\n\
  const scriptPath = path.join(__dirname, "generate_pdf.py");\n\
  const jsonData = JSON.stringify({ ...data, date });\n\
\n\
  let tempFilePath;\n\
\n\
  try {\n\
    tempFilePath = path.join(__dirname, `temp_data_${Date.now()}.json`);\n\
    await fs.writeFile(tempFilePath, jsonData);\n\
\n\
    const pythonProcess = spawn(pythonExecutable, [scriptPath, tempFilePath]);\n\
\n\
    let pdfBuffer = Buffer.from("");\n\
    let errorOutput = "";\n\
\n\
    pythonProcess.stdout.on("data", (chunk) => {\n\
      pdfBuffer = Buffer.concat([pdfBuffer, chunk]);\n\
    });\n\
\n\
    pythonProcess.stderr.on("data", (chunk) => {\n\
      errorOutput += chunk.toString();\n\
    });\n\
\n\
    pythonProcess.on("close", async (code) => {\n\
      if (code === 0) {\n\
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");\n\
        res.setHeader("Vary", "Origin");\n\
        res.setHeader("Content-Type", "application/pdf");\n\
        res.setHeader("Content-Disposition", "inline; filename=\\"report.pdf\\"");\n\
        res.send(pdfBuffer);\n\
      } else {\n\
        console.error(`Python script exited with code ${code}: ${errorOutput}`);\n\
        res.status(500).send(`Failed to generate PDF: ${errorOutput}`);\n\
      }\n\
      if (tempFilePath) {\n\
        try {\n\
          await fs.rm(tempFilePath, { force: true });\n\
        } catch (e) {\n\
          if (e && e.code !== "ENOENT") console.error("Error deleting temp file:", e);\n\
        }\n\
      }\n\
    });\n\
\n\
    pythonProcess.on("error", async (err) => {\n\
      console.error("Failed to start Python subprocess:", err);\n\
      res.status(500).send("Failed to initiate PDF generation process.");\n\
      if (tempFilePath) {\n\
        try {\n\
          await fs.rm(tempFilePath, { force: true });\n\
        } catch (e) {\n\
          if (e && e.code !== "ENOENT") console.error("Error deleting temp file:", e);\n\
        }\n\
      }\n\
    });\n\
  } catch (err) {\n\
    console.error("Error in PDF generation process:", err);\n\
    res.status(500).send("Internal server error during PDF generation.");\n\
    if (tempFilePath) {\n\
      try {\n\
        await fs.rm(tempFilePath, { force: true });\n\
      } catch (e) {\n\
        if (e && e.code !== "ENOENT") console.error("Error deleting temp file:", e);\n\
      }\n\
    }\n\
  }\n\
});\n\
\n\
// Health check\n\
app.get("/health", (req, res) => {\n\
  res.json({ status: "ok", timestamp: new Date().toISOString() });\n\
});\n\
\n\
// Catch all handler: send back React app for any non-API routes\n\
app.get("*", (req, res) => {\n\
  res.sendFile(path.join(__dirname, "public", "index.html"));\n\
});\n\
\n\
app.listen(port, "0.0.0.0", () => {\n\
  console.log(`Server listening on 0.0.0.0:${port}`);\n\
});' > server.js

CMD ["node", "server.js"]
